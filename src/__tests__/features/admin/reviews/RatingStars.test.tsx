import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingStars } from "@/features/admin/reviews/components/RatingStars";

describe("RatingStars Component (FE-25)", () => {
  it("render đúng aria-label và role img cho a11y", () => {
    render(<RatingStars rating={4.5} showNumber={true} />);

    const container = screen.getByRole("img", { name: "4.5 trên 5 sao" });
    expect(container).toBeInTheDocument();
  });

  it("hiển thị chữ số điểm khi showNumber = true và ẩn khi false", () => {
    const { rerender } = render(<RatingStars rating={5} showNumber={true} />);
    expect(screen.getByText("5.0")).toBeInTheDocument();

    rerender(<RatingStars rating={5} showNumber={false} />);
    expect(screen.queryByText("5.0")).not.toBeInTheDocument();
  });

  it("giới hạn điểm số trong khoảng [0, 5]", () => {
    const { rerender } = render(<RatingStars rating={6} />);
    expect(screen.getByRole("img", { name: "5 trên 5 sao" })).toBeInTheDocument();

    rerender(<RatingStars rating={-2} />);
    expect(screen.getByRole("img", { name: "0 trên 5 sao" })).toBeInTheDocument();
  });
});
