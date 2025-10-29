import React from "react";
import Avatar from "@mui/material/Avatar";
import { getStorageFileTypeFromName } from "../utils/StorageFiles.util";

type StorageFile = {
  gsutil_uri?: string;
  imageUrl?: string;
  fileName?: string;
};

type ProfileImageProps = {
  name?: string;
  files?: (File | StorageFile)[];
  imageUrl?: string; // Direct image URL
  size?: string;
  fontSize?: string;
  onClick?: () => void;
};

const ProfileImage: React.FC<ProfileImageProps> = ({
  name,
  files = [],
  imageUrl,
  size = "12rem",
  onClick,
  fontSize
}) => {
  // Priority: imageUrl prop > files array > fallback to initials
  let displayImageUrl = imageUrl;
  if (!displayImageUrl && files.length > 0) {
    const firstImageFile = files.find((file) => {
      const fileName = file instanceof File ? file.name : (file as StorageFile).fileName;
      return getStorageFileTypeFromName(fileName || "") === "image";
    });
    if (firstImageFile) {
      displayImageUrl =
        firstImageFile instanceof File
          ? URL.createObjectURL(firstImageFile)
          : (firstImageFile as StorageFile)?.imageUrl;
    }
  }

  return (
    <Avatar
      onClick={onClick}
      sx={{
        bgcolor: "var(--pallet-light-blue)",
        height: size,
        width: size,
        fontSize: fontSize, // Fixed: was {fontSize} (object syntax error)
        cursor: onClick ? "pointer" : "default",
      }}
      src={displayImageUrl}
      // Optional: Add imgProps for error handling if image fails to load
      imgProps={{
        onError: (e) => {
          console.warn("Failed to load profile image:", displayImageUrl);
          (e.target as HTMLImageElement).style.display = "none"; // Hide broken image
        }
      }}
    >
      {!displayImageUrl && name?.charAt(0).toUpperCase()}
    </Avatar>
  );
};

export default ProfileImage;