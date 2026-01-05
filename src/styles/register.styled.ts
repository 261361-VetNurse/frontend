import styled from 'styled-components';

export const RegisterContainer = styled.div`
  height: 100vh;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 8px 24px;
`;

export const RegisterCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px;
  gap: 36px;
`;

export const Header = styled.div`
  text-align: center;
  gap: 4px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

export const Subtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
