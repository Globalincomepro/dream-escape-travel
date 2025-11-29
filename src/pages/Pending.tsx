import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import charlesPotterImage from "@/assets/charles-potter.png";
import donnaPotterImage from "@/assets/donna-potter.png";

const Pending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="max-w-2xl p-12 text-center">
        <div className="flex gap-4 justify-center mb-6">
          <div className="relative">
            <img
              src={charlesPotterImage}
              alt="Charles Potter - MWR Lifestyle Ambassador"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-500 object-cover"
            />
          </div>
          <div className="relative">
            <img
              src={donnaPotterImage}
              alt="Donna Potter - MWR Lifestyle Ambassador"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-500 object-cover"
            />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Thank you for your interest in becoming an MWR Ambassador!
        </h1>

        <p className="text-muted-foreground mb-8">
          Our team will be in contact soon. We'll send you an email and call you. This typically takes 1-2 business
          days. You can reach us ASAP by calling 346-291-7376
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
          <Mail className="w-4 h-4" />
          <span>Check your email for updates</span>
        </div>

        <Button onClick={() => navigate("/")}>Return Home</Button>
      </Card>
    </div>
  );
};

export default Pending;
