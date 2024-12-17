import { makeStyles, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";

interface AccountOverviewProps {
  accountNames?: any[];
  companyNames?: any[];
  combiMap?: Record<string, Set<string>>;
}

const useStyles = makeStyles({
  root: {
    height: "100%",
  },
});

export const AccountOverview = (props: AccountOverviewProps) => {
  const styles = useStyles();
  const data = props?.combiMap;
  if (!data) {
    return <div>No accounts to view!</div>;
  }

  return (
    <Tree className={styles.root} size="small">
      {Object.entries(data).map((coyAndAccts) => (
        <TreeItem itemType="branch">
          <TreeItemLayout>{coyAndAccts[0]}</TreeItemLayout>
          <Tree>
            {Array.from(coyAndAccts[1]).map((acctName) => (
              <TreeItem itemType="leaf">
                <TreeItemLayout>{acctName}</TreeItemLayout>
              </TreeItem>
            ))}
          </Tree>
        </TreeItem>
      ))}
    </Tree>
  );
};
