import * as React from "react";
import { tokens, makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
    list: {
        marginTop: "20px",
    },
    listItem: {
        paddingBottom: "20px",
        display: "flex",
    },
    icon: {
        marginRight: "10px",
    },
    itemText: {
        fontSize: tokens.fontSizeBase300,
        fontColor: tokens.colorNeutralBackgroundStatic,
    },
    welcome__main: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    message: {
        fontSize: tokens.fontSizeBase500,
        fontColor: tokens.colorNeutralBackgroundStatic,
        fontWeight: tokens.fontWeightRegular,
        paddingLeft: "10px",
        paddingRight: "10px",
    },
});
const HeroList = (props) => {
    const { items, message } = props;
    const styles = useStyles();
    const listItems = items.map((item, index) => (React.createElement("li", { className: styles.listItem, key: index },
        React.createElement("i", { className: styles.icon }, item.icon),
        React.createElement("span", { className: styles.itemText }, item.primaryText))));
    return (React.createElement("div", { className: styles.welcome__main },
        React.createElement("h2", { className: styles.message }, message),
        React.createElement("ul", { className: styles.list }, listItems)));
};
export default HeroList;
//# sourceMappingURL=HeroList.js.map