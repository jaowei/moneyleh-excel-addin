# Moneyleh-excel-Addin

- Microsoft excel add in developed using vite instead of webpack. Based off of [this starter template](https://github.com/ExtraBB/Office-Addin-React-Vite-Template). With dependencies updated.
- Easily convert your bank statements into your excel sheet of choice.

> Singapore based financial statement parsing only

## How to

#### Prerequisites

1. Microsoft Excel installed locally (MacOS)
2. Microsoft Excel online (Windows/MacOS)

#### Install the addin

1. Download the file `src/manifest.prod.xml` from this repository and save it on your device.
2. Sideload the addin for MacOS, follow instructions [here](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-mac)
3. Sideload the addin on Windows, you can only do this on the web version. Follow instructions [here](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing)

> The addin has a static build and files are hosted on cloudflare pages at this link: https://moneyleh-excel-addin.pages.dev/taskpane

#### Use

## Supported Statement Formats

1. DBS account csv statement
2. DBS credit card PDF statement
3. UOB credit card and account xls statements
4. HSBC credit card csv statement
5. Moomoo monthly PDF statement
6. IBKR Flex CSV Report
7. Chocolate Finance monthly PDF statement
8. CPF Monthly PDF statement
9. Trust bank credit card monthly PDF statement

## Develop

#### Prerequisites

1. MacOS or Windows only, no WSL as there is no support for opening excel when you want to debug
2. Valid Microsoft Excel installed

#### Start up

1. To start the server run `npm run dev`
2. Then run `npm run start`, this should bring up a temporary excel spreadsheet with your add in attached so you can view the add in and debug.
3. Once done developing run `npm run stop`. You can also close the spreadsheet.

> For more information refer to the official docs [here](https://learn.microsoft.com/en-us/office/dev/add-ins/excel/).

## Further Enhancements

1. Add accounts overview

   - Shows latest transaction, remind if account not updated
   - Shows total value of account

2. Auto tagging

   - Automatically tag categories on transactions
   - Test if possible to add client side Naive Bayes classifier

3. Spending analysis & Budgeting

   - Analyse money inflows and outflows
   - Find trends of large recurring payments
   - Suggest budgets

4. Investment analysis
   - Determine portfolio CAGR/TWR/MWR
