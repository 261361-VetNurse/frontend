"use client";

import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import {theme} from "@/styles/tokens/theme";

export default function NewPetButton() {
  const router = useRouter();

  return (
      <div className="flex flex-col items-center justify-center gap-1.5">
          <IconButton
              onClick={() => router.push("/pet-owners/my-pets-page/add-new-pet")}
              sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white,
                  "&:active": {
                      backgroundColor: theme.colors.primaryDark,
                  },
              }}
          >
              <AddIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <span className="text-[14px] leading-[18px] max-w-[120px] truncate text-[#666666]">
              New Pet
          </span>
      </div>

  );
}
