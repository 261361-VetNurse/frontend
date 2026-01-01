import styled from "styled-components";
import { theme } from "./theme";

export const Page = styled.div`
  padding: 8px 24px;
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
  min-height: 100vh;
  gap: 10px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FabButton = styled.button`
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  border: none;
  color: ${theme.colors.white};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;
