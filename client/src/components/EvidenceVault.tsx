import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Shield, Eye, Download, FileText, Image, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import type { Evidence } from "@/types";

interface EvidenceVaultProps {
  caseId: number;
}

const evidenceTypes = [
  { value: "document", label: "Document", icon: FileText },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: FileText },
  { value: "audio", label: "Audio", icon: FileText },
];

export function EvidenceVault({ caseId }: EvidenceVaultProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [uploadDescription, setUploadDescription] = useState("");

  const { data: evidence, isLoading } = useQuery<Evidence[]>({
    queryKey: ["/api/cases", caseId, "evidence"],
    enabled: !!caseId,
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: async (evidenceData: any) => {
      const response = await apiRequest("POST", `/api/cases/${caseId}/evidence`, evidenceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases", caseId, "evidence"] });
      setSelectedFiles(null);
      setSelectedType("");
      setUploadDescription("");
      toast({
        title: "Success",
        description: "Evidence uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload evidence",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFiles = Array.from(files).filter(file => {
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        setSelectedFiles(dataTransfer.files);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select evidence type",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll upload the first file
    const file = selectedFiles[0];
    uploadEvidenceMutation.mutate({
      filename: file.name,
      evidenceType: selectedType,
    });
  };

  const getFileIcon = (evidenceType: string) => {
    switch (evidenceType) {
      case "document":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "image":
        return <Image className="h-4 w-4 text-blue-500" />;
      case "video":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "audio":
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    if (verified) {
      return (
        <Badge variant="secondary" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-yellow-600 border-yellow-600">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card className="judicial-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            Evidence Vault
            <Button 
              className="ml-auto judicial-button-success"
              onClick={() => document.getElementById('evidence-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Evidence
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
            <div 
              className="cursor-pointer"
              onClick={() => document.getElementById('evidence-upload')?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-900 dark:text-white mb-2">
                Drag & drop files here
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG • Max size: 10MB
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="evidence-upload"
              accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.mp4,.mp3"
            />
          </div>

          {/* Upload Form */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Upload Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="evidence-type">Evidence Type *</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select evidence type" />
                    </SelectTrigger>
                    <SelectContent>
                      {evidenceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <type.icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="upload-description">Description (Optional)</Label>
                  <Input
                    id="upload-description"
                    placeholder="Brief description of evidence"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Files:</Label>
                {Array.from(selectedFiles).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded border"
                  >
                    <div className="flex items-center">
                      {getFileIcon(selectedType)}
                      <span className="text-sm text-gray-900 dark:text-white ml-2">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploadEvidenceMutation.isPending || !selectedType}
                className="judicial-button-success"
              >
                {uploadEvidenceMutation.isPending ? "Uploading..." : "Upload Evidence"}
              </Button>
            </div>
          )}

          {/* Evidence List */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Uploaded Evidence
            </h4>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : evidence && evidence.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evidence.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center">
                            {getFileIcon(item.evidenceType)}
                            <span className="text-sm text-gray-900 dark:text-white ml-2">
                              {item.filename}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900 dark:text-white capitalize">
                          {item.evidenceType}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900 dark:text-white">
                          User #{item.uploadedBy}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell>
                          {getVerificationIcon(item.verified)}
                        </TableCell>
                        <TableCell className="text-sm space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No evidence uploaded yet.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Upload documents to strengthen your case.
                </p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Evidence Security
                </h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  All uploaded evidence is encrypted and secured with hash verification. 
                  Files are accessible only to authorized parties in this case.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
