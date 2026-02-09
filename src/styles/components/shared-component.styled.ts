import styled from "styled-components";
import { theme } from "../tokens/theme";

export const BackButton = styled.button`
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;
  cursor: pointer;
  svg {
    font-size: 16px;
    color: ${theme.colors.textPrimary};
  }
`;