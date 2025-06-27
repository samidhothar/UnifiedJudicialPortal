import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Home, Heart, Briefcase, FileText, Users, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface CaseFilingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CaseFormData {
  title: string;
  type: string;
  summary: string;
  court: string;
}

const caseTypes = [
  {
    id: "property",
    title: "Property Dispute",
    description: "Property ownership, boundary disputes, tenant issues",
    icon: Home,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "family",
    title: "Family Matter",
    description: "Divorce, custody, inheritance, marriage disputes",
    icon: Heart,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "civil",
    title: "Civil Matter",
    description: "Contract disputes, civil rights violations",
    icon: Briefcase,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Business disputes, contract breaches",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "criminal",
    title: "Criminal",
    description: "Criminal matters, complaints",
    icon: Users,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "tax",
    title: "Tax Matter",
    description: "Tax disputes, assessments, appeals",
    icon: FileText,
    color: "bg-indigo-100 text-indigo-600",
  },
];

const steps = [
  { id: 1, title: "Case Type", description: "Select the type of case" },
  { id: 2, title: "Details", description: "Provide case information" },
  { id: 3, title: "Documents", description: "Upload supporting documents" },
  { id: 4, title: "Review", description: "Review and submit" },
];

export function CaseFilingWizard({ isOpen, onClose }: CaseFilingWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState<CaseFormData>({
    title: "",
    type: "",
    summary: "",
    court: "",
  });

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      const response = await apiRequest("POST", "/api/cases", caseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({
        title: "Success",
        description: "Case filed successfully!",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to file case",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: "",
      type: "",
      summary: "",
      court: "",
    });
    setSelectedFiles(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCaseTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
    handleNext();
  };

  const handleFormChange = (field: keyof CaseFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.type || !formData.summary) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCaseMutation.mutate({
      ...formData,
      filedBy: user?.id,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.type;
      case 2:
        return !!formData.title && !!formData.summary;
      case 3:
        return true; // Documents are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>File New Case</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id 
                        ? "text-blue-600" 
                        : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    currentStep > step.id 
                      ? "bg-blue-600" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {/* Step 1: Case Type Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Case Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {caseTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.type === type.id
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:border-blue-300"
                    }`}
                    onClick={() => handleCaseTypeSelect(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div className={`w-10 h-10 ${type.color} rounded-full flex items-center justify-center mr-3`}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {type.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Case Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Case Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your case"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Case Summary *</Label>
                  <Textarea
                    id="summary"
                    placeholder="Provide a detailed description of your case, including relevant facts and what you're seeking..."
                    value={formData.summary}
                    onChange={(e) => handleFormChange("summary", e.target.value)}
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="court">Preferred Court</Label>
                  <Input
                    id="court"
                    placeholder="e.g., District Court Lahore (optional)"
                    value={formData.court}
                    onChange={(e) => handleFormChange("court", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Supporting Documents
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-900 dark:text-white mb-2">
                  Upload supporting documents
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Documents are optional but can strengthen your case
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <Button className="judicial-button-primary">
                    Select Files
                  </Button>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG • Max size: 10MB each
                </p>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Selected Files:
                  </h4>
                  <div className="space-y-2">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {file.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Review & Submit
              </h3>
              
              <Card className="judicial-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600 dark:text-gray-400">Case Type</Label>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {caseTypes.find(t => t.id === formData.type)?.title}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600 dark:text-gray-400">Title</Label>
                      <p className="text-gray-900 dark:text-white">{formData.title}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 dark:text-gray-400">Summary</Label>
                      <p className="text-gray-900 dark:text-white">{formData.summary}</p>
                    </div>
                    {formData.court && (
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Preferred Court</Label>
                        <p className="text-gray-900 dark:text-white">{formData.court}</p>
                      </div>
                    )}
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Documents</Label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedFiles.length} file(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important:</strong> Once submitted, your case will be reviewed by court staff. 
                  You will receive updates on the status and next steps via SMS and email.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="judicial-button-primary flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createCaseMutation.isPending || !canProceed()}
                className="judicial-button-primary"
              >
                {createCaseMutation.isPending ? "Filing..." : "Submit Case"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
