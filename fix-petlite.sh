#!/bin/bash

# Fix PetLite imports - should be from @/types/domain/pet, not from PetFilterSelector

echo "Fixing PetLite imports..."

# Fix all PetLite imports from PetFilterSelector to types/domain/pet
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|import type { PetLite } from '@/components/pet-owners/shared/PetFilterSelector'|import type { PetLite } from '@/types/domain/pet'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|import type { PetLite } from "@/components/pet-owners/shared/PetFilterSelector"|import type { PetLite } from "@/types/domain/pet"|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|type PetLite } from '@/components/pet-owners/shared/PetFilterSelector'|type PetLite } from '@/types/domain/pet'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|type PetLite, } from '@/components/pet-owners/shared/PetFilterSelector'|type PetLite, } from '@/types/domain/pet'|g" {} +

# Multi-line imports with PetLite
find src/components/pet-owners/MainPage/CalendarPage -type f -name "*.tsx" -exec sed -i '' '/PetFilterSelector.*$/,/^[^}]*$/{ s|type PetLite|// type PetLite - imported separately|; }' {} +

echo "PetLite import fixes complete!"
