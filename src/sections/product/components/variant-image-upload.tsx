import { useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import axios from "src/utils/axios";
import { endpoints } from "src/utils/axios";
import { useSnackbar } from "src/components/snackbar";
import Iconify from "src/components/iconify";

// ----------------------------------------------------------------------

interface VariantImageUploadProps {
  imageUrl?: string;
  variantIndex: number;
  isUploading: boolean;
  onUploadStart: (index: number) => void;
  onUploadEnd: (index: number) => void;
  onImageUploaded: (index: number, urls: string[], publicIds: string[]) => void;
  onDeleteImage: (index: number) => void;
  t: (key: string, options?: any) => string;
}

export default function VariantImageUpload({
  imageUrl,
  variantIndex,
  isUploading,
  onUploadStart,
  onUploadEnd,
  onImageUploaded,
  onDeleteImage,
  t,
}: VariantImageUploadProps) {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle variant image upload
  const handleUploadImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      // Validate all files first
      for (const file of selectedFiles) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          enqueueSnackbar(t("productForm.onlyJpgPngWebpAllowed"), { variant: "error" });
          return;
        }
        if (file.size > MAX_SIZE) {
          enqueueSnackbar(t("productForm.fileExceedsLimit", { fileName: file.name }), {
            variant: "error",
          });
          return;
        }
      }

      onUploadStart(variantIndex);

      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        formData.append("folder", "products");

        const response = await axios.post(endpoints.files.uploadMultiple, formData);
        const apiResponse = response.data;
        const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

        if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
          enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
          return;
        }

        // Extract URLs and publicIds
        const uploadedUrls: string[] = [];
        const publicIds: string[] = [];
        uploadedFiles.forEach((file: any) => {
          if (file?.url && file?.success !== false) {
            uploadedUrls.push(file.url);
            if (file.public_id) {
              publicIds.push(file.public_id);
            }
          }
        });

        if (uploadedUrls.length > 0) {
          onImageUploaded(variantIndex, uploadedUrls, publicIds);
          const successMsg =
            uploadedUrls.length === 1
              ? t("productForm.variantImageUploaded")
              : t("productForm.successfullyUploaded", { count: uploadedUrls.length });
          enqueueSnackbar(successMsg, { variant: "success" });
        } else {
          enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        }
      } catch (error: any) {
        console.error("Variant image upload error:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          t("productForm.uploadFailed");
        enqueueSnackbar(errorMessage, { variant: "error" });
      } finally {
        onUploadEnd(variantIndex);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [variantIndex, onUploadStart, onUploadEnd, onImageUploaded, enqueueSnackbar, t]
  );

  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
        {t("productForm.variantImage")}
      </Typography>

      {/* Image Preview or Upload Button */}
      {imageUrl ? (
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: 1.5,
            overflow: "hidden",
            border: "2px solid",
            borderColor: "primary.main",
            position: "relative",
            bgcolor: "background.paper",
            "&:hover .image-overlay": {
              opacity: 1,
            },
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt={`Variant ${variantIndex + 1} image`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
            }}
          />
          {/* Hover Overlay with Actions */}
          <Box
            className="image-overlay"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={handleUploadImage}
              disabled={isUploading}
            />
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="eva:refresh-fill" width={16} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{ minWidth: 100 }}
            >
              {t("productForm.change")}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<Iconify icon="eva:trash-2-outline" width={16} />}
              onClick={() => onDeleteImage(variantIndex)}
              sx={{ minWidth: 100 }}
            >
              {t("productForm.remove")}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={() => !isUploading && fileInputRef.current?.click()}
          sx={{
            width: 120,
            height: 120,
            borderRadius: 1.5,
            border: "2px dashed",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: isUploading ? "default" : "pointer",
            bgcolor: "background.paper",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: isUploading ? "divider" : "primary.main",
              bgcolor: isUploading ? "background.paper" : "action.hover",
            },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={handleUploadImage}
            disabled={isUploading}
          />
          <Iconify
            icon={isUploading ? "eos-icons:loading" : "eva:cloud-upload-fill"}
            width={32}
            sx={{ color: "text.disabled", mb: 1 }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", px: 1 }}>
            {isUploading ? t("productForm.uploading") : t("productForm.clickToUpload")}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

