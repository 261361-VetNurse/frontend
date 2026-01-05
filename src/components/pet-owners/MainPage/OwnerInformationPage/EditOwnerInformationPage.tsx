'use client';

import React, { useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import {
  Container,
  TopHeader,
  BackButton,
  PageTitle,
  Header,
  AvatarWrapper,
  AvatarImg,
  OwnerName,
  OwnerId
} from '../../../../styles/OwnerInformationPage.styles';
import { theme } from '../../../../styles/theme';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { SelectInput } from '../../shared/form/SelectInput';
import { PrimaryButton } from '../../shared/form/PrimaryButton';

const EditOwnerInformationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: 'Yoon',
    lastName: 'JH',
    gender: 'male',
    phone: '9786534246',
    email: 'spdiu9ughe@msodgiur'
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Navigate back or show success message
  };

  return (
    <Container>
      <TopHeader>
        <BackButton onClick={() => router.back()} aria-label="back">
          <ArrowBackIosNewIcon />
        </BackButton>
        <PageTitle>Edit Owner Information</PageTitle>
      </TopHeader>
      
      <div className="relative flex flex-col items-center justify-center py-4">
        <div className="relative w-24 h-24 rounded-full border-2 border-white shadow-md">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <img src="/images/profile-test.png" alt="Owner Avatar" className="w-[96px] h-[96px] object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white cursor-pointer" style={{ backgroundColor: theme.colors.primary }}>
            <EditIcon style={{ fontSize: '16px', color: 'white' }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px' }}>
        <FormField label="First Name" htmlFor="firstName">
          <TextInput
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </FormField>

        <FormField label="Last Name" htmlFor="lastName">
          <TextInput
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </FormField>

        <FormField label="Gender" htmlFor="gender">
          <SelectInput
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            options={genderOptions}
          />
        </FormField>

        <FormField label="Phone" htmlFor="phone">
          <TextInput
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <TextInput
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </FormField>

        <div style={{ marginTop: '32px' }}>
          <PrimaryButton size='md' type="submit">
            Update
          </PrimaryButton>
        </div>
      </form>
    </Container>
  );
};

export default EditOwnerInformationPage;
