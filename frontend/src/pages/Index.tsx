import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SimpleFooter from "@/components/SimpleFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <SimpleFooter />
    </div>
  );
};

export default Index;
