/**
 * Refer to original source code here: https://github.com/ttezel/bayes
 *
 * This code has been modified from the source code with modern ES6 syntax and typescript.
 *
 */

export const fromJson = (jsonStr: string) => {
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error("Naivebayes.fromJson expects a valid JSON string.");
  }
  // init a new classifier
  return new NaiveBayesClassifier(parsed.state, parsed.options);
};

export interface NaiveBayesClassifierState {
  tokeniser: (text: string) => string;
  vocabulary: Record<string, any>;
  vocabularySize: number;
  totalDocuments: number;
  docCount: Record<string, number>;
  wordCount: Record<string, number>;
  wordFrequencyCount: Record<string, any>;
  categories: Record<string, number>;
}

export class NaiveBayesClassifier {
  // set options object
  options = {};

  tokeniser = function (text: string) {
    //remove punctuation from text - remove anything that isn't a word char or a space
    const rgxPunctuation = /[^(a-zA-ZA-Яa-я0-9_)+\s]/g;

    const sanitized = text.replace(rgxPunctuation, " ");

    return sanitized.split(/\s+/);
  };

  //initialize our vocabulary and its size
  vocabulary: Record<string, any> = {};
  vocabularySize = 0;

  //number of documents we have learned from
  totalDocuments = 0;

  //document frequency table for each of our categories
  //=> for each category, how often were documents mapped to it
  docCount: Record<string, number> = {};

  //for each category, how many words total were mapped to it
  wordCount: Record<string, number> = {};

  //word frequency table for each category
  //=> for each category, how frequent was a given word mapped to it
  wordFrequencyCount: Record<string, any> = {};

  //hashmap of our category names
  categories: Record<string, any> = {};

  constructor(state?: NaiveBayesClassifierState, options?: Record<string, any>) {
    if (typeof options !== "undefined") {
      if (!options || typeof options !== "object" || Array.isArray(options)) {
        throw TypeError("NaiveBayes got invalid `options`: `" + options + "`. Pass in an object.");
      }
      this.options = options;
      if (options.tokeniser) {
        this.tokeniser = options.tokeniser;
      }
    }
    this.vocabulary = state?.vocabulary ?? {};
    this.vocabularySize = state?.vocabularySize ?? 0;
    this.totalDocuments = state?.totalDocuments ?? 0;
    this.docCount = state?.docCount ?? {};
    this.wordCount = state?.wordCount ?? {};
    this.wordFrequencyCount = state?.wordFrequencyCount ?? {};
    this.categories = state?.categories ?? {};
  }

  initialiseCategory(categoryName: string) {
    if (!this.categories[categoryName]) {
      this.docCount[categoryName] = 0;
      this.wordCount[categoryName] = 0;
      this.wordFrequencyCount[categoryName] = {};
      this.categories[categoryName] = true;
    }
    return this;
  }

  async learn(text: string, category: string) {
    //initialize category data structures if we've never seen this category
    this.initialiseCategory(category);

    //update our count of how many documents mapped to this category
    this.docCount[category]++;

    //update the total number of documents we have learned from
    this.totalDocuments++;

    //normalize the text into a word array
    let tokens = await this.tokeniser(text);

    //get a frequency count for each token in the text
    let frequencyTable = this.frequencyTable(tokens);

    /*
      Update our vocabulary and our word frequency count for this category
   */
    Object.keys(frequencyTable).forEach((token) => {
      //add this word to our vocabulary if not already existing
      if (!this.vocabulary[token]) {
        this.vocabulary[token] = true;
        this.vocabularySize++;
      }

      const frequencyInText = frequencyTable[token];

      //update the frequency information for this word in this category
      if (!this.wordFrequencyCount[category][token]) this.wordFrequencyCount[category][token] = frequencyInText;
      else this.wordFrequencyCount[category][token] += frequencyInText;

      //update the count of all words we have seen mapped to this category
      this.wordCount[category] += frequencyInText;
    });

    return this;
  }

  frequencyTable(tokens: any[]) {
    const frequencyTable: Record<string, any> = {};

    tokens.forEach(function (token) {
      if (!frequencyTable[token]) frequencyTable[token] = 1;
      else frequencyTable[token]++;
    });

    return frequencyTable;
  }

  async categorise(text: string) {
    let maxProbability = -Infinity,
      chosenCategory: string | null = null;

    const tokens = await this.tokeniser(text);
    const frequencyTable = this.frequencyTable(tokens);

    //iterate thru our categories to find the one with max probability for this text
    Object.keys(this.categories).forEach((category) => {
      //start by calculating the overall probability of this category
      //=>  out of all documents we've ever looked at, how many were
      //    mapped to this category
      const categoryProbability = this.docCount[category] / this.totalDocuments;

      //take the log to avoid underflow
      let logProbability = Math.log(categoryProbability);

      //now determine P( w | c ) for each word `w` in the text
      Object.keys(frequencyTable).forEach((token) => {
        const frequencyInText = frequencyTable[token];
        const tokenProbability = this.tokenProbability(token, category);

        // console.log('token: %s category: `%s` tokenProbability: %d', token, category, tokenProbability)

        //determine the log of the P( w | c ) for this word
        logProbability += frequencyInText * Math.log(tokenProbability);
      });

      if (logProbability > maxProbability) {
        maxProbability = logProbability;
        chosenCategory = category;
      }
    });

    return chosenCategory;
  }

  tokenProbability(token: string, category: string) {
    //how many times this word has occurred in documents mapped to this category
    const wordFrequencyCount = this.wordFrequencyCount[category][token] || 0;

    //what is the count of all words that have ever been mapped to this category
    const wordCount = this.wordCount[category];

    //use laplace Add-1 Smoothing equation
    return (wordFrequencyCount + 1) / (wordCount + this.vocabularySize);
  }

  toJson() {
    return JSON.stringify({
      state: {
        categories: this.categories,
        docCount: this.docCount,
        totalDocuments: this.totalDocuments,
        vocabulary: this.vocabulary,
        vocabularySize: this.vocabularySize,
        wordCount: this.wordCount,
        wordFrequencyCount: this.wordFrequencyCount,
      },
      options: this.options,
    });
  }
}
