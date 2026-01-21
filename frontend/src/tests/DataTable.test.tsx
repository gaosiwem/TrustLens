import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataTable from "../app/admin/components/DataTable";

describe("DataTable Component", () => {
  const mockOnParamsChange = jest.fn();
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "role", label: "Role" },
  ];
  const data = [
    { id: "1", name: "Alice", role: "Admin" },
    { id: "2", name: "Bob", role: "User" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders data and headers correctly", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        totalCount={2}
        limit={10}
        offset={0}
        onParamsChange={mockOnParamsChange}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("triggers onParamsChange when searching (debounced)", async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        totalCount={2}
        limit={10}
        offset={0}
        onParamsChange={mockOnParamsChange}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Should not trigger immediately
    expect(mockOnParamsChange).not.toHaveBeenCalled();

    // Fast-forward time
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "test", offset: 0 })
      );
    });
  });

  it("triggers onParamsChange when sorting", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        totalCount={2}
        limit={10}
        offset={0}
        onParamsChange={mockOnParamsChange}
      />
    );

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    expect(mockOnParamsChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: "name", sortOrder: "asc" })
    );

    fireEvent.click(nameHeader);
    expect(mockOnParamsChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: "name", sortOrder: "desc" })
    );
  });

  it("triggers onParamsChange when paginating", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        totalCount={25}
        limit={10}
        offset={0}
        onParamsChange={mockOnParamsChange}
      />
    );

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(mockOnParamsChange).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10 })
    );
  });
});
