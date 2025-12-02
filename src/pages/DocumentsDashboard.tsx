import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { SummaryCard } from "@/components/SummaryCard";
import { DocumentCard } from "@/components/DocumentCard";
import { FileTextIcon, ClockIcon, CheckCircleIcon, SearchIcon, ChevronDownIcon } from "@/components/icons/Icons";
import { getDocuments } from "@/api";
import { Document, DocumentStatus } from "@/types";

type FilterStatus = "all" | DocumentStatus;

export default function DocumentsDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.status === "Pending Review").length;
    const completed = documents.filter((d) => d.status === "Reviewed" || d.status === "Approved").length;
    return { total, pending, completed };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All Status" },
    { value: "Pending Review", label: "Pending Review" },
    { value: "Reviewed", label: "Reviewed" },
    { value: "Approved", label: "Approved" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Documents Dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard
            title="Total Documents"
            value={stats.total}
            icon={<FileTextIcon className="w-6 h-6 text-accent" />}
            iconColor="bg-accent/10"
          />
          <SummaryCard
            title="Pending Review"
            value={stats.pending}
            icon={<ClockIcon className="w-6 h-6 text-warning" />}
            iconColor="bg-warning/10"
          />
          <SummaryCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircleIcon className="w-6 h-6 text-success" />}
            iconColor="bg-success/10"
          />
        </div>

        {/* Document List Container */}
        <div className="bg-card rounded-xl card-shadow p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="input-field w-full sm:w-48 flex items-center justify-between text-left"
              >
                <span>{statusOptions.find((o) => o.value === statusFilter)?.label}</span>
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-48 bg-card rounded-lg card-shadow-lg border border-border z-10 animate-fade-in">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        statusFilter === option.value ? "bg-muted font-medium" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Document List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
