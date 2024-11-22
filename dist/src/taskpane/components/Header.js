import * as React from "react";
import { Image, tokens, makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
    welcome__header: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "30px",
        paddingTop: "100px",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    message: {
        fontSize: tokens.fontSizeHero900,
        fontWeight: tokens.fontWeightRegular,
        fontColor: tokens.colorNeutralBackgroundStatic,
    },
});
const Header = (props) => {
    const { title, logo, message } = props;
    const styles = useStyles();
    return (React.createElement("section", { className: styles.welcome__header },
        React.createElement(Image, { width: "90", height: "90", src: logo, alt: title }),
        React.createElement("h1", { className: styles.message }, message)));
};
export default Header;
//# sourceMappingURL=Header.js.map