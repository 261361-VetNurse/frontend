#!/bin/bash

# Fix remaining PetLite imports in all components

echo "Fixing all remaining PetLite imports..."

# List of files that need PetLite imports fixed
files=(
  "src/components/pet-owners/MainPage/CalendarPage/appointment/AddAppointmentPopup.tsx"
  "src/components/pet-owners/MainPage/CalendarPage/record/AddRecordPopup.tsx"
  "src/components/pet-owners/MainPage/CalendarPage/record/RecordPage.tsx"
  "src/components/pet-owners/MainPage/MyPetsPage/pet-info/PetInfo.tsx"
  "src/components/pet-owners/MainPage/MyPetsPage/symptoms/RecordPage.tsx"
  "src/components/pet-owners/MainPage/MyPetsPage/medical/Medical.tsx"
  "src/components/pet-owners/shared/appointment/AddAppointmentPopup.tsx"
)

# For each file, add PetLite import from @/types/domain/pet if importing from PetFilterSelector
for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    # Add import at the top if not exists and remove from PetFilterSelector import
    sed -i '' '/from "@\/components\/pet-owners\/shared\/PetFilterSelector"/s/type PetLite, *//' "$file"
    sed -i '' '/from "@\/components\/pet-owners\/shared\/PetFilterSelector"/s/type PetLite,*//' "$file"
    sed -i '' '/from "..\/..\/..\/..\/shared\/PetFilterSelector"/s/type PetLite, *//' "$file"
    
    # Check if we need to add the PetLite import
    if grep -q "PetLite" "$file"; then
      # Add import after the PetFilterSelector import if not exists
      if ! grep -q "from '@/types/domain/pet'" "$file"; then
        sed -i '' '/from "@\/components\/pet-owners\/shared\/PetFilterSelector"/a\
import type { PetLite } from "@/types/domain/pet";
' "$file"
      fi
    fi
  fi
done

echo "PetLite import fixes complete!"
