import { render, screen } from "@testing-library/react";
import RegisterPage from "../app/auth/register/page";
import { SessionProvider } from "next-auth/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("RegisterPage", () => {
  it("renders register page", () => {
    render(
      <SessionProvider session={null}>
        <RegisterPage />
      </SessionProvider>
    );
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
  });
});
