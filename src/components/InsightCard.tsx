import { Card } from "@/components/ui/card";

interface InsightCardProps {
  title: string;
  description: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, description }) => {
  return (
    <Card className="p-4 shadow border">
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
};
