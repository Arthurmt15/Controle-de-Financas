/**
 * @file components/features/ImageUploader/styles.ts
 * @description Estilos do componente ImageUploader.
 */

import styled from 'styled-components';

/**
 * Container principal
 */
export const UploaderContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Título
 */
export const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

/**
 * Ícone do título
 */
export const TitleIcon = styled.span`
  font-size: 20px;
`;

/**
 * Área de upload
 */
export const DropZone = styled.div<{ $isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
  border: 2px dashed ${({ $isDragging, theme }) =>
    $isDragging ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ $isDragging, theme }) =>
    $isDragging ? `${theme.colors.primary}10` : theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}05`};
  }
`;

/**
 * Ícone de upload
 */
export const UploadIcon = styled.span`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Texto de instrução
 */
export const InstructionText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

/**
 * Texto de highlight
 */
export const HighlightText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

/**
 * Input de arquivo oculto
 */
export const HiddenInput = styled.input`
  display: none;
`;

/**
 * Preview da imagem
 */
export const ImagePreview = styled.div`
  position: relative;
  margin-top: 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

/**
 * Imagem
 */
export const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

/**
 * Botão de remover
 */
export const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

/**
 * Container dos botões
 */
export const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  button {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:first-child {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.textSecondary};
      border: 1px solid ${({ theme }) => theme.colors.border};

      &:hover {
        background-color: ${({ theme }) => theme.colors.background};
      }
    }

    &:last-child {
      background-color: ${({ theme }) => theme.colors.primary};
      color: white;

      &:hover {
        opacity: 0.9;
      }
    }
  }
`;

/**
 * Área de resultado da análise
 */
export const AnalysisResult = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: ${({ theme }) => `${theme.colors.success}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.success}30`};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

/**
 * Título da análise
 */
export const AnalysisTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

/**
 * Dica de edição
 */
export const EditHint = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`;

/**
 * Campo da análise
 */
export const AnalysisField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.success}20`};

  &:last-child {
    border-bottom: none;
  }
`;

/**
 * Label do campo
 */
export const FieldLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Valor do campo
 */
export const FieldValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Input editável do campo
 */
export const FieldInput = styled.input`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  max-width: 200px;
  text-align: right;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &[type="date"] {
    max-width: 160px;
  }

  &[type="text"] {
    text-align: left;
    max-width: 250px;
  }
`;

/**
 * Select editável do campo
 */
export const FieldSelect = styled.select`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  max-width: 250px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Mensagem de erro
 */
export const ErrorMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: ${({ theme }) => `${theme.colors.danger}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.danger}30`};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
`;
