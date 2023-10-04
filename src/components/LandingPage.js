import React, { useState } from "react";
import {
  Button,
  Container,
  Grid,
  makeStyles,
  IconButton,
  Box,
  Typography,
  Paper,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import PdfViewer from "./PdfViewer";
import PdfUpload from "./PdfUpload";
import RefreshIcon from "@material-ui/icons/Refresh";
import * as pdfjs from "pdfjs-dist";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const useStyles = makeStyles((theme) => ({
  landingPage: {
    textAlign: "center",
    marginTop: theme.spacing(4),
  },
  newUploadButton: {
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    color: theme.palette.primary.main,
  },
  viewerContainer: {
    height: "90vh",
    position: "relative",
    backgroundColor: theme.palette.primary.main,
    overflow: "auto",
  },
  pdfViewerWrapper: {
    padding: theme.spacing(0.001),
    backgroundColor: theme.palette.primary.main,
  },
  responsePaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: `2px solid ${theme.palette.primary.main}`,
    height: "70vh",
    overflow: "auto",
  },
}));

async function extractText(pdfUrl) {
  const pdf = await pdfjs.getDocument(pdfUrl).promise;
  let textContent = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const text = await page.getTextContent();
    textContent += text.items.map((item) => item.str).join(" ");
  }

  return textContent;
}

async function processMessageToChatGPT(text, apiKey) {
  const apiRequestBody = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "I'm a Student using ChatGPT for learning" },
      { role: "user", content: text },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiRequestBody),
  });

  return response.json();
}

function LandingPage() {
  const classes = useStyles();
  const [pdfFile, setPdfFile] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleFileUpload = async (file) => {
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfFile(url);
      const text = await extractText(url);
      setPdfText(text);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      const textToSend =
        "Answer the Question given below but only using the information that is available within the context text provided. Also Note the reponse you give should be in the form of html so that it can directly be displayed on a webpage. Make sure to use heading bold, itlics, underline, paragraphs.... and many of the other elements to make the reponse very presentable and pleasing for a web page." +
        "Question: " +
        userPrompt +
        " " +
        "Context Text: " +
        pdfText;

      const response = await processMessageToChatGPT(textToSend, apiKey);

      if (response && response.choices && response.choices.length > 0) {
        const content = response.choices[0]?.message?.content;
        if (content) {
          setApiResponse(content);
        }
      } else {
        console.error("Unexpected API response:", response);
      }
    } catch (error) {
      console.error("Something went wrong:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById("pdfContent");
    const pdf = new jsPDF("p", "mm", "a4");

    // A4 dimensions in mm
    const pageHeightMM = 297;
    const pageWidthMM = 210;

    // Convert A4 dimensions from mm to pixels
    const pageHeightPx = (pageHeightMM * 96) / 25.4;

    // Initialize PDF offsets
    let pdfPageHeight = 0;

    // Capture and add pages
    for (
      let yOffset = 0;
      yOffset < element.scrollHeight;
      yOffset += pageHeightPx
    ) {
      const canvas = await html2canvas(element, {
        y: yOffset,
        height: pageHeightPx,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(imgData, "PNG", 0, pdfPageHeight, pageWidthMM, pageHeightMM);

      if (yOffset + pageHeightPx < element.scrollHeight) {
        pdf.addPage();
      }
    }

    pdf.save("document.pdf");
  };

  return (
    <Container className={classes.landingPage}>
      <Grid container spacing={3} justify="center" alignItems="center">
        <Grid item xs={12}>
          <h1>Talk to Doc</h1>
        </Grid>
        {!apiKey && (
          <Grid item xs={12}>
            <TextField
              type="password" // hide the API key input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter OpenAI ChatGPT API key"
              fullWidth
              style={{ marginBottom: "20px" }}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <label htmlFor="replace-upload" className={classes.newUploadButton}>
            <IconButton color="primary" component="span">
              <RefreshIcon />
            </IconButton>
            <Box>
              <Typography variant="body2" color="inherit">
                Replace
              </Typography>
            </Box>
          </label>
          {!pdfFile && <PdfUpload onFileUpload={handleFileUpload} />}
          {pdfFile ? (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} className={classes.viewerContainer}>
                  <input
                    type="file"
                    accept="application/pdf"
                    id="replace-upload"
                    style={{ display: "none" }}
                    onChange={(event) =>
                      handleFileUpload(event.target.files[0])
                    }
                  />
                  <div className={classes.pdfViewerWrapper}>
                    <PdfViewer fileUrl={pdfFile} />
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Ask a Question"
                    fullWidth
                  />
                  <Button
                    onClick={handleSendRequest}
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "10px" }}
                    disabled={!apiKey}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="secondary" />
                    ) : (
                      "Answer"
                    )}
                  </Button>

                  <Button
                    onClick={generatePDF}
                    variant="contained"
                    color="secondary"
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                    disabled={!apiResponse} // Disable button if apiResponse is empty
                  >
                    Download as PDF
                  </Button>
                  <Paper id="pdfContent" className={classes.responsePaper}>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      component="div"
                      dangerouslySetInnerHTML={{ __html: apiResponse }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </>
          ) : null}
        </Grid>
      </Grid>
    </Container>
  );
}

export default LandingPage;
