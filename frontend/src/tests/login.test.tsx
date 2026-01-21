import { render, screen } from "@testing-library/react";
import LoginPage from "../app/auth/login/page";
import { SessionProvider } from "next-auth/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("LoginPage", () => {
  it("renders login page and inputs", () => {
    render(
      <SessionProvider session={null}>
        <LoginPage />
      </SessionProvider>
    );
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
