#!/bin/bash

# Fix remaining missed imports

echo "Fixing remaining import issues..."

# Fix @/lib/hooks/usePets -> @/hooks (for usePet and usePets)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/lib/hooks/usePets"|from "@/hooks"|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/lib/hooks/usePets'|from '@/hooks'|g" {} +

# Fix @/styles/formStyled/* -> @/styles/components/form/*
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/styles/formStyled/FormField.styles'|from '@/styles/components/form/FormField.styles'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/styles/formStyled/PrimaryButton.styles'|from '@/styles/components/form/PrimaryButton.styles'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/styles/formStyled/SelectInput.styles'|from '@/styles/components/form/SelectInput.styles'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/styles/formStyled/TextInput.styles'|from '@/styles/components/form/TextInput.styles'|g" {} +

# Fix @/styles/myPetsPage.styled -> @/styles/components/my-pets-page.styled
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/styles/myPetsPage.styled'|from '@/styles/components/my-pets-page.styled'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/styles/myPetsPage.styled"|from "@/styles/components/my-pets-page.styled"|g' {} +

# Fix @/styles/calendar.styled -> @/styles/components/calendar.styled
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/styles/calendar.styled'|from '@/styles/components/calendar.styled'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/styles/calendar.styled"|from "@/styles/components/calendar.styled"|g' {} +

# Fix relative theme imports in style files (./theme -> ../tokens/theme)
find src/styles/components -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from './theme'|from '../tokens/theme'|g" {} +
find src/styles/components -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "./theme"|from "../tokens/theme"|g' {} +

# Fix relative theme imports in form subfolder (../theme -> ../../tokens/theme)
find src/styles/components/form -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '../theme'|from '../../tokens/theme'|g" {} +
find src/styles/components/form -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "../theme"|from "../../tokens/theme"|g' {} +

# Fix api-client import path (../types/dashboard -> @/types/domain/dashboard)
find src/services -type f \( -name "*.ts"  -o -name "*.tsx" \) -exec sed -i '' "s|import('../types/dashboard')|import('@/types/domain/dashboard')|g" {} +

echo "Remaining import fixes complete!"
