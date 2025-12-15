import { SanhokMap } from "@/components/SanhokMap";

const Index = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-background">
      <div className="flex-1 relative">
        <SanhokMap />
      </div>
    </div>
  );
};

export default Index;
