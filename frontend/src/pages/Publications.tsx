import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Search } from "lucide-react"

const Publications = () => {
  return (
    <div className="min-h-screen bg-background">
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text">
                    Search for Publications
                </h1>
                <p className="text-xl text-muted-foreground">
                    Explore NASA's published documents
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-card rounded-lg p-6 shadow-soft mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search publications, authors, or keywords..."
                        // value={searchQuery}
                        // onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                    </div>

                    {/* Clear Filters Button */}
                    <Button
                    variant="outline"
                    // onClick={clearFilters}
                    // disabled={!hasActiveFilters}
                    className="w-full"
                    >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear Filters
                    </Button>
                </div>
            </div>

            
        </div>
    </div>
  )
}

export default Publications