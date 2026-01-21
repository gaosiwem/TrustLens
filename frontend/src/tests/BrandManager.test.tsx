import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrandManager from "../app/admin/components/BrandManager";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("BrandManager Component", () => {
  const mockBrands = [
    { id: "1", name: "Apple", isVerified: true },
    { id: "2", name: "Samsung", isVerified: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: { items: mockBrands, total: 2 },
    });
  });

  it("fetches and displays brands on mount", async () => {
    render(<BrandManager />);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("/brands"),
      expect.any(Object)
    );

    await waitFor(() => {
      expect(screen.getByText("apple")).toBeInTheDocument();
      expect(screen.getByText("samsung")).toBeInTheDocument();
    });
  });

  it("opens the Add Brand modal when clicking the add button", async () => {
    render(<BrandManager />);

    const addButton = screen.getByText("Add New Brand");
    fireEvent.click(addButton);

    expect(screen.getByText("Add Brand Profile")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter brand name")).toBeInTheDocument();
  });

  it("successfully adds a brand through the modal", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { id: "3", name: "Sony", isVerified: true },
    });

    render(<BrandManager />);

    // Open modal
    fireEvent.click(screen.getByText("Add New Brand"));

    // Fill form
    const input = screen.getByPlaceholderText("Enter brand name");
    fireEvent.change(input, { target: { value: "Sony" } });

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Add Brand" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/brands"),
        { name: "Sony" },
        expect.any(Object)
      );
      // Modal should be closed
      expect(screen.queryByText("Add Brand Profile")).not.toBeInTheDocument();
    });
  });

  it("toggles brand verification", async () => {
    mockedAxios.patch.mockResolvedValue({
      data: { id: "2", name: "Samsung", isVerified: true },
    });

    render(<BrandManager />);

    await waitFor(() => {
      const verifyBtn = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.includes("Verify"));
      if (verifyBtn) fireEvent.click(verifyBtn);
    });

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/brands/2/verify"),
        {},
        expect.any(Object)
      );
    });
  });
});
