import { Rocket } from "lucide-react"
import { Button } from "./ui/button"
import CardSwap, { Card } from "./CardSwap"
import earthHero from "@/assets/earth-hero.jpg";
import marsMission from "@/assets/mars-mission.jpg";
import nebula from "@/assets/nebula.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className="text-center lg:text-left space-y-8 animate-fade-in -translate-y-12">
                    <div className="inline-block">
                        <span className="px-4 py-2 bg-card border border-primary/30 rounded-full text-sm font-medium text-primary">
                            Bioscience
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                        NASA Space Biology Knowledge Engine
                        <span className="block bg-clip-text text-accent">
                            GARDS
                        </span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Explore the wonders of space biology with NASA’s cutting-edge knowledge engine, GARDS. Unlock new insights and accelerate research in the biosciences of space exploration.
                    </p>

                </div>
            {/* CardSwap Component */}
            <div className="relative h-[300px] animate-fade-in max-w-[600px] mx-auto lg:mx-0" style={{ animationDelay: "0.2s" }}>
                <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
                height={500}
                width={600}
                >
                <Card>
                    <div className="relative h-full rounded-2xl overflow-hidden border border-primary/30 shadow-cosmic group">
                    <img 
                        src={earthHero} 
                        alt="Earth from space" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h3 className="text-3xl font-bold mb-2 text-white">Earth</h3>
                        <p className="text-muted-foreground">awdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
                    </div>
                    </div>
                </Card>
                <Card>
                    <div className="relative h-full rounded-2xl overflow-hidden border border-secondary/30 shadow-cosmic group">
                    <img 
                        src={marsMission} 
                        alt="Mars mission" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h3 className="text-3xl font-bold text-white">Mars</h3>
                        <p className="text-muted-foreground">awdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
                    </div>
                    </div>
                </Card>
                <Card>
                    <div className="relative h-full rounded-2xl overflow-hidden border border-accent/30 shadow-cosmic group">
                    <img 
                        src={nebula} 
                        alt="Cosmic nebula" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h3 className="text-3xl font-bold mb-2 text-white">Universe</h3>
                        <p className="text-muted-foreground">awdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
                    </div>
                    </div>
                </Card>
                </CardSwap>
            </div>
            </div>
        </div>
    </section>
  )
}

export default Hero