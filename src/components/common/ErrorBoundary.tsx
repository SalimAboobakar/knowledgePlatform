import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <ErrorIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" gutterBottom color="error.main">
              حدث خطأ غير متوقع
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              عذراً، حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  تفاصيل الخطأ (للمطورين):
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.50',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRefresh}
              size="large"
            >
              إعادة تحميل الصفحة
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 