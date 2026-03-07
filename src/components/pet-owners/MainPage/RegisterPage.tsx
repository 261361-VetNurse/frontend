'use client';

import React, { useState } from 'react';
import { useRouter } from '@/hooks/use-next-routing';
import { FormField } from '@/components/pet-owners/shared/form/FormField';
import { TextInput } from '@/components/pet-owners/shared/form/TextInput';
import { SelectInput } from '@/components/pet-owners/shared/form/SelectInput';
import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
import {
  RegisterContainer,
  RegisterCard,
  Header,
  Title,
  Subtitle,
  Form
} from '@/styles/components/register.styled';
import { authStorage, registerOwner } from '@/services/api/client';
import { RegisterOwnerPayload } from '@/types/api/auth.dto';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
  });

  const isFormComplete =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.gender &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.addressLine1.trim() &&
    formData.subdistrict.trim() &&
    formData.district.trim() &&
    formData.province.trim() &&
    formData.postalCode.trim();

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const handleInputChange =
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.value,
        }));

        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: undefined }));
        }
      };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.subdistrict.trim()) newErrors.subdistrict = 'Subdistrict is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const token = authStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const payload: RegisterOwnerPayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2 || null,
        subdistrict: formData.subdistrict,
        district: formData.district,
        province: formData.province,
        postal_code: formData.postalCode,
      };

      await registerOwner(token, payload);

      // Load user profile into AuthContext so home-page has user data immediately
      await login(token);

      router.push('/pet-owners/home-page');
    } catch (err) {
      console.error("Registration failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        {errorMsg && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <Header>
          <Title>Register</Title>
          <Subtitle>Please fill the form</Subtitle>
        </Header>

        <Form data-cy="register-form" onSubmit={handleSubmit}>
          <FormField label="First Name" htmlFor="firstName" error={errors.firstName}>
            <TextInput
              data-cy="register-first-name"
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              placeholder="Enter your first name"
              error={!!errors.firstName}
            />
          </FormField>

          <FormField label="Last Name" htmlFor="lastName" error={errors.lastName}>
            <TextInput
              data-cy="register-last-name"
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              placeholder="Enter your last name"
              error={!!errors.lastName}
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender}>
            <SelectInput
              data-cy="register-gender"
              id="gender"
              value={formData.gender}
              onChange={handleInputChange('gender')}
              options={genderOptions}
              placeholder="Select gender"
              error={!!errors.gender}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone" error={errors.phone}>
            <TextInput
              data-cy="register-phone"
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              placeholder="Enter your phone number"
              error={!!errors.phone}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <TextInput
              data-cy="register-email"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="Enter your email"
              error={!!errors.email}
            />
          </FormField>

          <div style={{ borderTop: '1px solid #eee', margin: '10px 0', paddingTop: '10px', fontWeight: 'bold' }}>Address</div>

          <FormField label="Address Line 1" htmlFor="addressLine1" error={errors.addressLine1}>
            <TextInput
              data-cy="register-address-line1"
              id="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange('addressLine1')}
              placeholder="House number, street, etc."
              error={!!errors.addressLine1}
            />
          </FormField>

          <FormField label="Address Line 2 (Optional)" htmlFor="addressLine2" error={errors.addressLine2}>
            <TextInput
              data-cy="register-address-line2"
              id="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange('addressLine2')}
              placeholder="Apartment, suite, etc."
              error={!!errors.addressLine2}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <FormField label="Subdistrict" htmlFor="subdistrict" error={errors.subdistrict}>
              <TextInput
                data-cy="register-subdistrict"
                id="subdistrict"
                value={formData.subdistrict}
                onChange={handleInputChange('subdistrict')}
                placeholder="Subdistrict"
                error={!!errors.subdistrict}
              />
            </FormField>

            <FormField label="District" htmlFor="district" error={errors.district}>
              <TextInput
                data-cy="register-district"
                id="district"
                value={formData.district}
                onChange={handleInputChange('district')}
                placeholder="District"
                error={!!errors.district}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <FormField label="Province" htmlFor="province" error={errors.province}>
              <TextInput
                data-cy="register-province"
                id="province"
                value={formData.province}
                onChange={handleInputChange('province')}
                placeholder="Province"
                error={!!errors.province}
              />
            </FormField>

            <FormField label="Postal Code" htmlFor="postalCode" error={errors.postalCode}>
              <TextInput
                data-cy="register-postal-code"
                id="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange('postalCode')}
                placeholder="Postal Code"
                error={!!errors.postalCode}
              />
            </FormField>
          </div>

        </Form>

        <PrimaryButton
          data-cy="register-submit"
          size="md"
          type="submit"
          disabled={loading || !isFormComplete}
          onClick={handleSubmit}
        >
          {loading ? 'Registering...' : 'Register'}
        </PrimaryButton>
      </RegisterCard>
    </RegisterContainer>
  );
}
