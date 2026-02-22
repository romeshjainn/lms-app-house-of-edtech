import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string, title = 'Success') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    });
  },

  error: (message: string, title = 'Something went wrong') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: 4500,
      position: 'top',
    });
  },

  info: (message: string, title = 'Info') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    });
  },
};
