import { CiSettings } from "react-icons/ci";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

import ExportButton from "@/components/ActionButtons/ExportButton";
import CategorizeButton from "@/components/ActionButtons/Categorization/CategorizeButton";
import CategoryConfigDialog from "@/components/ActionButtons/Categorization/CategoryConfigDialog";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

type Props = {
  pluginName: string;
  // categories: string[];
  transactions: FireflyTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FireflyTransaction[]>>;
};

export default function ActionButtons({
  pluginName,
  transactions,
  setTransactions,
}: Props) {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <CategorizeButton
          transactions={transactions}
          setTransactions={setTransactions}
        />
        <CategoryConfigDialog>
          <Button size="icon">
            <CiSettings />
          </Button>
        </CategoryConfigDialog>
      </ButtonGroup>
      <ButtonGroup>
        <ExportButton transactions={transactions} pluginName={pluginName} />
      </ButtonGroup>
    </ButtonGroup>
  );
}
