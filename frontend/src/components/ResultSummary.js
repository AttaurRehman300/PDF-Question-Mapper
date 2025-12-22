import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  List as ListIcon
} from '@mui/icons-material';

const ResultSummary = ({ result }) => {
  if (result.error) {
    return (
      <Paper sx={{ p: 3, mt: 2, bgcolor: 'error.light' }}>
        <Typography color="error">
          Error analyzing {result.fileName}: {result.error}
        </Typography>
      </Paper>
    );
  }

  const getRangeDisplay = (range) => {
    if (!range) return 'No Questions';
    return `Questions ${range}`;
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <DescriptionIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {result.fileName}
            </Typography>
            <Chip
              label={`${result.totalPages} pages`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {/* 1. Printed Page Sequence Section - TOP */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NumbersIcon sx={{ mr: 1 }} />
              <strong>Printed Page Sequence</strong>
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              alignItems: 'center'
            }}>
              {result.printedPageSequence.map((p, i) => (
                <React.Fragment key={i}>
                  <Chip 
                    label={p} 
                    size="small" 
                    variant="outlined"
                  />
                  {i < result.printedPageSequence.length - 1 && (
                    <Typography sx={{ color: 'text.secondary', mx: 0.5 }}>
                      →
                    </Typography>
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>

          {/* 2. Page-by-Page Analysis Section - BELOW Sequence */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ListIcon sx={{ mr: 1 }} />
              <strong>Page-by-Page Analysis</strong>
            </Typography>

            {/* 3. Table with rounded box container */}
            <Paper 
              variant="outlined" 
              sx={{ 
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2
              }}
            >
              <TableContainer>
                <Table sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                        <Typography variant="subtitle2">Printed Page</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                        <Typography variant="subtitle2">Question Range</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                        <Typography variant="subtitle2">Question Starts</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {result.pageSummary.map((page, idx) => (
                      <TableRow 
                        key={idx}
                        sx={{ 
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Chip 
                            label={page.printedPage} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>

                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: page.range ? 'bold' : 'normal',
                              color: page.range ? 'primary.main' : 'text.secondary'
                            }}
                          >
                            {getRangeDisplay(page.range)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 2 }}>
                          {page.questionStarts.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {page.questionStarts.map((q, i) => (
                                <Chip
                                  key={i}
                                  label={`Q${q}`}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Null
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default ResultSummary;