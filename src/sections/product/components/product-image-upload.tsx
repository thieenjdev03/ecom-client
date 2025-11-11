import { useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import axios from "src/utils/axios";
import { endpoints } from "src/utils/axios";
import { useSnackbar } from "src/components/snackbar";
import Iconify from "src/components/iconify";
import { RHFAutocomplete } from "src/components/hook-form";

// ----------------------------------------------------------------------

interface ProductImageUploadProps {
  name?: string;
  maxFiles?: number;
  uploadingImages: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onImageMappingSave?: (imageUrl: string, publicId: string) => void;
  imagePublicIdMapRef: React.MutableRefObject<Map<string, string>>;
  t: (key: string, options?: any) => string;
}

export default function ProductImageUpload({
  name = "images",
  maxFiles = 5,
  uploadingImages,
  onUploadStart,
  onUploadEnd,
  onImageMappingSave,
  imagePublicIdMapRef,
  t,
}: ProductImageUploadProps) {
  const { watch, setValue } = useFormContext();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = (watch(name) as string[]) || [];

  // Handle image upload
  const handleUploadImages = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      if (images.length + selectedFiles.length > maxFiles) {
        enqueueSnackbar(t("productForm.maximumFiveImagesAllowed"), { variant: "warning" });
        return;
      }

      // Validate file types and sizes
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

      onUploadStart();

      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        formData.append("folder", "products");

        const response = await axios.post(endpoints.files.uploadMultiple, formData);
        const apiResponse = response.data;
        const uploadedFiles = apiResponse?.data?.files || apiResponse?.files || [];

        if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
          console.error("Invalid response format or no files uploaded:", apiResponse);
          enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
          return;
        }

        // Extract URLs and store publicId mapping
        const uploadedUrls: string[] = [];
        uploadedFiles.forEach((file: any) => {
          if (file?.url && file?.success !== false) {
            const imageUrl = file.url;
            uploadedUrls.push(imageUrl);

            // Store mapping between URL and publicId for deletion
            if (file.public_id) {
              imagePublicIdMapRef.current.set(imageUrl, file.public_id);
              onImageMappingSave?.(imageUrl, file.public_id);
            }
          }
        });

        if (uploadedUrls.length > 0) {
          const updatedImages = [...images, ...uploadedUrls];
          setValue(name, updatedImages, { shouldValidate: true });
          enqueueSnackbar(
            t("productForm.successfullyUploaded", { count: uploadedUrls.length }),
            { variant: "success" }
          );
        } else {
          enqueueSnackbar(t("productForm.noImagesUploaded"), { variant: "warning" });
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          t("productForm.uploadFailed");
        enqueueSnackbar(errorMessage, { variant: "error" });
      } finally {
        onUploadEnd();
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [images, maxFiles, name, setValue, enqueueSnackbar, t, onUploadStart, onUploadEnd, imagePublicIdMapRef, onImageMappingSave]
  );

  // Handle image deletion
  const handleDeleteImage = useCallback(
    async (imageUrl: string) => {
      const updatedImages = images.filter((url) => url !== imageUrl);
      setValue(name, updatedImages, { shouldValidate: true });

      const publicId = imagePublicIdMapRef.current.get(imageUrl);
      if (publicId) {
        try {
          await axios.delete(endpoints.files.delete(publicId), {
            data: { resourceType: "image" },
          });
          imagePublicIdMapRef.current.delete(imageUrl);
        } catch (error) {
          console.warn("Failed to delete image from server:", error);
          imagePublicIdMapRef.current.delete(imageUrl);
        }
      }
    },
    [images, name, setValue, imagePublicIdMapRef]
  );

  return (
    <Stack spacing={1}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle2">{t("productForm.images")}</Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          style={{ display: "none" }}
          onChange={handleUploadImages}
          disabled={uploadingImages}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImages || images.length >= maxFiles}
          sx={{ minWidth: 120 }}
        >
          {uploadingImages ? t("productForm.uploading") : t("productForm.uploadImages")}
        </Button>
      </Box>

      {/* Image thumbnails preview */}
      {images.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
            mt: 2,
          }}
        >
          {images.map((imageUrl, index) => (
            <Box
              key={`${imageUrl}-${index}`}
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: "100%", // Square aspect ratio
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.neutral",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.lighter}`,
                  "& .delete-button": {
                    opacity: 1,
                  },
                },
              }}
            >
              <Box
                component="img"
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
                }}
              />
              {/* Image index badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  color: "common.white",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </Box>
              {/* Delete button */}
              <IconButton
                size="small"
                onClick={() => handleDeleteImage(imageUrl)}
                className="delete-button"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "error.main",
                  color: "common.white",
                  opacity: 0.9,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "error.darker",
                    opacity: 1,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Iconify icon="eva:close-fill" width={18} />
              </IconButton>
              {/* Hover overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Manual URL input (optional) */}
      <Box sx={{ mt: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
        >
          {t("productForm.orAddUrlManually")}
        </Typography>
        <RHFAutocomplete
          name={name}
          placeholder={t("productForm.pasteImageUrl")}
          multiple
          freeSolo
          options={[]}
          getOptionLabel={(option) => option as unknown as string}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option as unknown as string}
                label={option as unknown as string}
                size="small"
                color="primary"
                variant="soft"
              />
            ))
          }
        />
      </Box>

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {t("productForm.imagesHelperText")}
      </Typography>
    </Stack>
  );
}

