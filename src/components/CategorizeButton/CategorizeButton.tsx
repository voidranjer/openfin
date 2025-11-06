import { GoogleGenAI, Type } from "@google/genai";
import type React from "react";
import { IoPlayOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import type { FireflyTransaction } from "@/chrome/core/types/firefly";

async function categorizeLLM(categories: string[], transactions: string[]) {
  const ai = new GoogleGenAI({
    // apiKey: process.env.GEMINI_API_KEY,
    apiKey: "AIzaSyBnuLcTBunCCL5F30gAxqIjePO7fKldqW8",
  });
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
          text: `Categories: ${categories.join(",")}

          Transactions:
          ${transactions.join("\n")}
          
          Special rules:
          - Anything containing 'HTSP' should be 'Transportation'
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

type Props = {
  // categories: string[];
  transactions: FireflyTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FireflyTransaction[]>>;
};

const categories = [
  "Bill Payments",
  "Dining",
  "Education",
  "Entertainment",
  "Transportation",
  "Groceries",
  "Health",
  "Home",
  "Insurance",
  "Misc",
  "Paycheque",
  "Savings and Investments",
  "Taxes and government",
  "Transfers",
  "Utilities",
  "Subscriptions",
];

export default function CategorizeButton({
  transactions,
  setTransactions,
}: Props) {
  async function handleCategorize() {
    const transactionDescriptions = transactions.map(
      (tx) => `${tx.description} : ${tx.amount.toFixed(2)}`
    );
    const response = await categorizeLLM(categories, transactionDescriptions);
    const llmTransactions = JSON.parse(response).categories;

    setTransactions((oldTransactions: FireflyTransaction[]) =>
      oldTransactions.map((tx, index) => ({
        ...tx,
        category_name: llmTransactions[index] || "Uncategorized",
      }))
    );
  }

  return (
    <Button
      className="text-black bg-blue-200 hover:bg-blue-300"
      size="sm"
      onClick={handleCategorize}
    >
      <IoPlayOutline />
      Categorize
    </Button>
  );
}
