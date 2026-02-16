'use client';

import React, { useState, useEffect } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';
import {
  Container,
  TopHeader,
  BackButton,
  PageTitle,
} from '@/styles/components/owner-information.styled';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { SelectInput } from '../../shared/form/SelectInput';
import { PrimaryButton } from '../../shared/form/PrimaryButton';
import { getUserProfile, updateUserProfile, authStorage } from '@/services/api/client';
import { UserProfileUpdatePayload } from '@/types/api/auth.dto';
import { ImageUpload } from '@/components/shared/ImageUpload';

const EditOwnerInformationPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>("/images/profile-test.png");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    phone: '',
    email: '',
    line_id: ''
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authStorage.getToken() || "";
        const user = await getUserProfile(token);
        setFormData({
          firstName: user.fname || '',
          lastName: user.lname || '',
          gender: user.gender || 'male',
          phone: user.phone || '',
          email: user.email || '',
          line_id: user.line_id || ''
        });
        if (user.picture_url) {
          setProfilePicture(user.picture_url);
        }

      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = authStorage.getToken() || "";

      // Prepare payload aligned with backend UserProfileUpdate schema
      const updateData: UserProfileUpdatePayload = {
        fname: formData.firstName,
        lname: formData.lastName,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        line_id: formData.line_id,
        picture_url: profilePicture
      };

      await updateUserProfile(token, updateData);
      router.back();

    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Container><div className="p-4 text-center">Loading...</div></Container>;
  }

  return (
    <Container>
      <TopHeader>
        <BackButton onClick={() => router.back()} aria-label="back">
          <ArrowBackIosNewIcon />
        </BackButton>
        <PageTitle>Edit Owner Information</PageTitle>
      </TopHeader>

      {error && <div className="text-red-500 text-center p-2">{error}</div>}

      <div className="relative flex flex-col items-center justify-center py-4">
        <ImageUpload
          folder="pet-owner-profile"
          currentImage={profilePicture}
          onUploadComplete={(url) => setProfilePicture(url)}
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md self-center"
        />
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

        <FormField label="Line ID" htmlFor="line_id">
          <TextInput
            id="line_id"
            value={formData.line_id}
            onChange={(e) => handleInputChange('line_id', e.target.value)}
          />
        </FormField>

        <div style={{ marginTop: '32px' }}>
          <PrimaryButton size='md' type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update'}
          </PrimaryButton>
        </div>
      </form>
    </Container>
  );
};

export default EditOwnerInformationPage;
