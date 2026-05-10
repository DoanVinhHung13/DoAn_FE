const mockInventory = [
  { id: 1, name: "NPK Fertilizer 15-15-15", category: "Fertilizer", quantity: 500, unit: "kg", lastUpdated: "2023-05-10" },
  { id: 2, name: "Tomato Seeds (Hybrid)", category: "Seeds", quantity: 50, unit: "packets", lastUpdated: "2023-05-11" },
  { id: 3, name: "Organic Pesticide Neem Oil", category: "Pesticide", quantity: 200, unit: "liters", lastUpdated: "2023-05-09" }
];

const InventoryService = {
  // TODO: Replace with real backend API
  getListInventory: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      Status: 0,
      Object: mockInventory
    };
  }
};

export default InventoryService;
