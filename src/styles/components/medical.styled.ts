"use client";

import styled from "@emotion/styled";

export const Page = styled.div`
  position: relative;
  padding: 0 16px;
  padding-bottom: 96px; /* กัน FAB + safe space */
`;

export const FabButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #0ea5e9; /* sky-500 */
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);

  transition: transform 120ms ease, background 120ms ease;

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background: #0284c7; /* sky-600 */
  }
`;
