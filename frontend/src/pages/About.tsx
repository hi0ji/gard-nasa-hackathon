import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const About = () => {
  const teamMembers = [
    {
      name: 'Norlan Mendoza',
      role: 'UI Designer',
      image: '/placeholder.svg',
      initials: 'NM'
    },
    {
      name: 'Tophy Linganay',
      role: 'Backend Developer',
      image: '/placeholder.svg',
      initials: 'TL'
    },
    {
      name: 'PJ Allen Figuracion',
      role: 'Frontend Developer',
      image: '/placeholder.svg',
      initials: 'PF'
    },
    {
      name: 'Matthew Ferri Tanutan',
      role: 'Backend Developer',
      image: '/placeholder.svg',
      initials: 'MT'
    },
    {
      name: 'Raymar Serondo',
      role: 'Backend Developer',
      image: '/placeholder.svg',
      initials: 'RS'
    },
    {
      name: 'Kim Comiling',
      role: 'Absenot',
      image: '/placeholder.svg',
      initials: 'KC'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="container py-16 space-y-16 text-center">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-hero bg-clip-text bg-primary underline underline-offset-8">
            GARD
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generative AI for Research Discovery
          </p>
        </div>

        {/* Team Members */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.name} className="mx-4 sm:mx-0 border-border/50 bg-card/50 backdrop-blur hover:shadow-elegant transition-smooth hover:scale-105">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* NASA Challenge & Innovation */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NASA Challenge */}
            <Card className="mx-4 sm:mx-0 border-primary/20 bg-gradient-subtle backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">NASA Challenge</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The NASA Space Biology program faces the challenge of synthesizing vast amounts of 
                  research data from multiple experiments conducted in space environments. With thousands 
                  of publications spanning decades of research, scientists need efficient ways to discover 
                  relevant findings, identify patterns, and generate new hypotheses. Traditional search 
                  methods are insufficient for the complex, interdisciplinary nature of space bioscience research.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is to develop an AI-powered platform that transforms how researchers interact 
                  with NASA's biological science database, making knowledge discovery faster, more intuitive, 
                  and more comprehensive.
                </p>
              </CardContent>
            </Card>

            {/* NASA Innovation */}
            <Card className="mx-4 sm:mx-0 border-primary/20 bg-gradient-subtle backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">NASA Innovation</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  GARD leverages cutting-edge generative AI technology to revolutionize space bioscience 
                  research. Our platform uses advanced natural language processing to understand complex 
                  scientific queries, semantic search to find relevant publications across vast databases, 
                  and knowledge graph technology to reveal hidden connections between research findings.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By combining these technologies, GARD enables researchers to ask natural language questions, 
                  receive AI-generated summaries of relevant research, explore interactive visualizations of 
                  scientific relationships, and discover new research directions through intelligent synthesis 
                  of existing knowledge. This innovation accelerates scientific discovery and helps NASA maximize 
                  the value of decades of space biology research.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
