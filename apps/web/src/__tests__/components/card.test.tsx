import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders Card with all parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    render(<Card className="custom-card" data-testid="card" />);

    expect(screen.getByTestId("card")).toHaveClass("custom-card");
  });

  it("renders CardHeader with correct styles", () => {
    render(
      <CardHeader data-testid="header">
        <CardTitle>Title</CardTitle>
      </CardHeader>,
    );

    expect(screen.getByTestId("header")).toHaveClass("flex");
    expect(screen.getByTestId("header")).toHaveClass("flex-col");
  });

  it("renders CardTitle with correct styles", () => {
    render(<CardTitle data-testid="title">My Title</CardTitle>);

    const title = screen.getByTestId("title");
    expect(title).toHaveClass("text-2xl");
    expect(title).toHaveClass("font-semibold");
  });

  it("renders CardDescription with correct styles", () => {
    render(
      <CardDescription data-testid="desc">My Description</CardDescription>,
    );

    const desc = screen.getByTestId("desc");
    expect(desc).toHaveClass("text-sm");
    expect(desc).toHaveClass("text-muted-foreground");
  });

  it("renders CardContent with correct padding", () => {
    render(<CardContent data-testid="content">Content</CardContent>);

    expect(screen.getByTestId("content")).toHaveClass("p-6");
  });

  it("renders CardFooter with correct styles", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);

    expect(screen.getByTestId("footer")).toHaveClass("flex");
    expect(screen.getByTestId("footer")).toHaveClass("items-center");
  });
});
