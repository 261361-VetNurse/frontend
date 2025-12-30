import styled from 'styled-components';

export const FormFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Label = styled.label`
  font-weight: 700;
  font-size: 16px;
  color: #374151;
  margin-bottom: 8px;
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
`;
