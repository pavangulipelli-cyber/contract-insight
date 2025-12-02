import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AttributeCard } from "@/components/AttributeCard";
import { PDFViewer } from "@/components/PDFViewer";
import {
  ArrowLeftIcon,
  SearchIcon,
  AlertCircleIcon,
  DownloadIcon,
} from "@/components/icons/Icons";
import {
  getDocumentById,
  getAttributesByDocumentId,
  saveReview,
  exportAttributes,
  getPdfUrl,
} from "@/api";
import { Document, Attribute } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function ContractReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contractDoc, setContractDoc] = useState<Document | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [correctedValues, setCorrectedValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        const [docData, attrData] = await Promise.all([
          getDocumentById(id),
          getAttributesByDocumentId(id),
        ]);

        if (!docData) {
          navigate("/documents");
          return;
        }

        setContractDoc(docData);
        setAttributes(attrData);

        // Initialize corrected values
        const initialValues: Record<string, string> = {};
        attrData.forEach((attr) => {
          initialValues[attr.id] = attr.correctedValue || "";
        });
        setCorrectedValues(initialValues);

        // Select first attribute by default
        if (attrData.length > 0) {
          setSelectedAttributeId(attrData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch document:", error);
        toast({
          title: "Error",
          description: "Failed to load document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  const filteredAttributes = useMemo(() => {
    return attributes.filter((attr) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        attr.name.toLowerCase().includes(searchLower) ||
        attr.section.toLowerCase().includes(searchLower) ||
        attr.category.toLowerCase().includes(searchLower)
      );
    });
  }, [attributes, searchQuery]);

  const selectedAttribute = useMemo(() => {
    return attributes.find((attr) => attr.id === selectedAttributeId) || null;
  }, [attributes, selectedAttributeId]);

  const lowConfidenceCount = useMemo(() => {
    return attributes.filter((attr) => attr.confidenceLevel === "low").length;
  }, [attributes]);

  const handleAcceptAll = () => {
    const newValues: Record<string, string> = {};
    attributes.forEach((attr) => {
      newValues[attr.id] = attr.extractedValue;
    });
    setCorrectedValues(newValues);
    toast({
      title: "Values Accepted",
      description: "All extracted values have been copied to corrected fields.",
    });
  };

  const handleSaveReview = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      const payload = {
        documentId: id,
        attributes: Object.entries(correctedValues).map(([attrId, value]) => ({
          id: attrId,
          correctedValue: value,
        })),
        status: "Reviewed" as const,
      };

      await saveReview(id, payload);
      toast({
        title: "Review Saved",
        description: "Your review has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save review:", error);
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportAttributes = async (format: "csv" | "json") => {
    if (!id) return;

    setIsExporting(true);
    try {
      const blob = await exportAttributes(id, format);

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${contractDoc?.title.replace(/\.[^/.]+$/, "")}-attributes.${format}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Attributes exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Error",
        description: "Failed to export attributes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Get PDF URL from storage reference
  const pdfUrl = contractDoc?.storageRef ? getPdfUrl(contractDoc.storageRef) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Contract Review" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!contractDoc) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Contract Review" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link
              to="/documents"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Documents
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Contract Review</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered attribute extraction and validation
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Document ID: {id}</span>
            <span>·</span>
            <span>{attributes.length} attributes</span>
            {lowConfidenceCount > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircleIcon className="w-4 h-4" />
                  {lowConfidenceCount} low confidence
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Attributes */}
          <div className="bg-card rounded-xl card-shadow p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-foreground">
                Extracted Attributes
              </h2>

              {/* Export dropdown */}
              <div className="relative group">
                <button
                  disabled={isExporting}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground rounded transition-colors disabled:opacity-50"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export
                </button>

                <div className="absolute right-0 mt-1 hidden group-hover:block z-10">
                  <div className="bg-card rounded-lg card-shadow-lg border border-border overflow-hidden">
                    <button
                      onClick={() => handleExportAttributes("csv")}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExportAttributes("json")}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review and correct attributes. Low-confidence values are highlighted.
            </p>

            {/* Search */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search attributes or sections…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Attribute List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredAttributes.map((attr) => (
                <AttributeCard
                  key={attr.id}
                  attribute={attr}
                  isSelected={selectedAttributeId === attr.id}
                  onSelect={() => setSelectedAttributeId(attr.id)}
                  correctedValue={correctedValues[attr.id] || ""}
                  onCorrectedValueChange={(value) =>
                    setCorrectedValues((prev) => ({ ...prev, [attr.id]: value }))
                  }
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
              <button onClick={handleAcceptAll} className="btn-secondary flex-1">
                Accept All Extracted Values
              </button>
              <button
                onClick={handleSaveReview}
                disabled={isSaving}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Review"}
              </button>
            </div>
          </div>

          {/* Right Panel: PDF Viewer */}
          <div className="lg:sticky lg:top-8">
            <PDFViewer
              pdfUrl={pdfUrl}
              selectedAttribute={selectedAttribute}
              documentTitle={contractDoc.title}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
