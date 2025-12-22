import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import FileUpload from './components/FileUpload';
import ResultSummary from './components/ResultSummary';
import { analyzePDFs } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileUpload = async (files) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await analyzePDFs(formData);
      setResults(response.data.results);
      setSuccess(`Successfully analyzed ${files.length} PDF file(s)`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze PDFs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              PDF Question Mapper
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            PDF Question Analysis Tool
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Upload PDF files to analyze question distribution and page numbering
          </Typography>

          <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
            <FileUpload onUpload={handleFileUpload} disabled={loading} />
          </Paper>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Analyzing PDFs...
              </Typography>
            </Box>
          )}

          {results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Analysis Results
              </Typography>
              {results.map((result, index) => (
                <ResultSummary key={index} result={result} />
              ))}
            </Box>
          )}

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>

          <Snackbar 
            open={!!success} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;