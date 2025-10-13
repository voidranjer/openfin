export type RogersApiResponse = {
  statusCode: string;
  activitySummary: {
    id: number;
    activities: {
      referenceNumber: string;
      activityType: string;
      amount: {
        value: string;
        currency: "CAD" | string;
      };
      activityStatus: "APPROVED" | string;
      activityCategory: "PURCHASE" | "PAYMENT";
      activityClassification: "PURCHASE" | "PAYMENT";
      cardNumber: string;
      merchant: {
        name: string;
        categoryCode: number;
        categoryDescription: string; // TODO: map this to "Notes" in firefly
        category: string; // TODO: replace this with a known list of mapped categories
        address: {
          city: string;
          stateProvince: string;
          postalCode: string;
          countryCode: string;
        };
      };
      date: string;
      activityCategoryCode: string;
      customerId: string;
      postedDate: string;
      name: {
        nameOnCard: string;
      };
    }[];
  };
};
