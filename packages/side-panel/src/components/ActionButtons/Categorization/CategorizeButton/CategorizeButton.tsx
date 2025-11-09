import { GoogleGenAI, Type } from "@google/genai";
import { useState } from "react";
import { IoPlayOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { FireflyTransaction } from "@openbanker/core/types";
import { defaultCategories } from "@/components/ActionButtons/Categorization/CategoryConfigDialog/CategoryConfigDialog";
import useChromeStorage from "@/hooks/useChromeStorage";

async function categorizeLLM(
  apiKey: string,
  transactions: string[],
  categories: string,
  rules: string
) {
  const ai = new GoogleGenAI({ apiKey });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["categories"],
      properties: {
        categories: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    },
    systemInstruction: [
      {
        text: `Given a list of categories and a list of transactions, return the most appropriate categories for each transaction, in order.`,
      },
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Categories: ${categories}

          Transactions:
          ${transactions.join("\n")}
          
          Special rules:
          ${rules}
          `,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let responseText = "";
  for await (const chunk of response) {
    responseText += chunk.text;
  }

  return responseText;
}

export default function CategorizeButton() {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [transactions, setTransactions] = useChromeStorage<
    FireflyTransaction[]
  >("transactions", []);
  const [categories] = useChromeStorage<string>(
    "categories",
    defaultCategories
  );
  const [rules] = useChromeStorage<string>("rules", "");
  const [apiKey] = useChromeStorage<string>("apiKey", "");

  const handleCategorize = async () => {
    setIsCategorizing(true);
    const transactionDescriptions = transactions.map((t) =>
      [
        `"${t.date}"`,
        `"${t.description}"`,
        t.amount,
        t.type,
        `"${t.notes}"`,
      ].join(",")
    );
    try {
      const result = await categorizeLLM(
        apiKey,
        transactionDescriptions,
        categories,
        rules
      );
      const categorized = JSON.parse(result).categories as string[];
      const newTransactions = transactions.map((t, i) => {
        const newTransaction = { ...t };
        newTransaction.category_name = categorized[i];
        return newTransaction;
      });
      setTransactions(newTransactions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCategorizing(false);
    }
  };

  return (
    <Button
      className="text-black bg-blue-200 hover:bg-blue-300 group"
      size="sm"
      onClick={handleCategorize}
      disabled={isCategorizing}
    >
      {isCategorizing ? (
        <Spinner />
      ) : (
        <IoPlayOutline className="transition-transform duration-300 ease-in-out group-hover:scale-150" />
      )}
      Auto-categorize
    </Button>
  );
}
