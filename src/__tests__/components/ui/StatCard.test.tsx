import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CarFront } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

describe("StatCard component", () => {
  it("renders metric label and tabular value", () => {
    render(
      <StatCard
        icon={CarFront}
        label="Tổng số phương tiện"
        value={128}
        subtext="Cập nhật 5 phút trước"
      />,
    );

    expect(screen.getByText("Tổng số phương tiện")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("Cập nhật 5 phút trước")).toBeInTheDocument();
  });

  it("renders trend badge when trend info is provided", () => {
    render(
      <StatCard
        label="Doanh thu tháng"
        value="54.200.000 ₫"
        trend={{
          value: "+12.5%",
          direction: "up",
          label: "so với tháng trước",
        }}
      />,
    );

    expect(screen.getByText("+12.5%")).toBeInTheDocument();
    expect(screen.getByText("so với tháng trước")).toBeInTheDocument();
  });
});
