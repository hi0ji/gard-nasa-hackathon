import Hero from '@/components/Hero';
import Particles from '@/components/Particles'
import { useResolvedTheme } from '@/lib/utils';

const Home = () => {
  const resolvedTheme = useResolvedTheme();

  const particleColors = resolvedTheme === 'dark' ? ['#ffffff'] : ['#000000'];

  return (
    <>
      <div className='relative min-h-screen'>
        {/* Particle background */}
        <div className="absolute inset-0 z-0">
            <Particles
            key={resolvedTheme}
            particleColors={particleColors}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
            />
        </div>
        
        {/* Foreground content */}
        <div className="h-full pointer-events-none">
            <Hero />
        </div>
      </div>
    </>
  )
}

export default Home