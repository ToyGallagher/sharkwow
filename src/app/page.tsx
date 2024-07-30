import HeroSection from "src/components/homepage/HeroSection";
import PopularCreator from "src/components/homepage/PopularProject";
import PopularProject from "src/components/homepage/PopularCreator";

export default function RootPage() {
    return (
        <>  
            <HeroSection/>
            <PopularProject/>
            <PopularCreator/>
        </>
    );
}
