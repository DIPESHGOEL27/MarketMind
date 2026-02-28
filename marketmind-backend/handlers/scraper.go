package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
)

// GoogleFinanceQuote represents scraped stock data
type GoogleFinanceQuote struct {
	Symbol string  `json:"symbol"`
	Price  float64 `json:"price"`
	Change float64 `json:"change"`
}

// Exchange mapping for common US stocks
var exchangeMap = map[string]string{
	"AAPL":  "NASDAQ",
	"GOOGL": "NASDAQ",
	"GOOG":  "NASDAQ",
	"MSFT":  "NASDAQ",
	"AMZN":  "NASDAQ",
	"META":  "NASDAQ",
	"TSLA":  "NASDAQ",
	"NVDA":  "NASDAQ",
	"NFLX":  "NASDAQ",
	"AMD":   "NASDAQ",
	"INTC":  "NASDAQ",
	"JPM":   "NYSE",
	"V":     "NYSE",
	"JNJ":   "NYSE",
	"WMT":   "NYSE",
	"PG":    "NYSE",
	"MA":    "NYSE",
	"UNH":   "NYSE",
	"HD":    "NYSE",
	"DIS":   "NYSE",
	"BAC":   "NYSE",
}

// ScrapedNewsItem represents a news article from Google Finance
type ScrapedNewsItem struct {
	Title   string `json:"title"`
	Summary string `json:"summary"`
	Source  string `json:"source"`
	Link    string `json:"link"`
	Date    string `json:"date"`
}

var (
	// News cache to prevent slow loads and frequent scraping
	newsCache = struct {
		sync.RWMutex
		Results map[string][]ScrapedNewsItem
		Expiry  map[string]time.Time
	}{
		Results: make(map[string][]ScrapedNewsItem),
		Expiry:  make(map[string]time.Time),
	}
)

// ScrapeGoogleFinance fetches stock data from Google Finance
func ScrapeGoogleFinance(symbol string) (*GoogleFinanceQuote, error) {
	// Determine exchange
	exchange, ok := exchangeMap[strings.ToUpper(symbol)]
	if !ok {
		exchange = "NASDAQ" // Default fallback
	}

	url := fmt.Sprintf("https://www.google.com/finance/quote/%s:%s", strings.ToUpper(symbol), exchange)

	// Create client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Create request with headers to mimic browser
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch page: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("received status code %d", resp.StatusCode)
	}

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	quote := &GoogleFinanceQuote{
		Symbol: strings.ToUpper(symbol),
	}

	// Extract price - Google Finance uses class "YMlKec fxKbKc" for the main price
	// The first .YMlKec on the quote page is typically the current price
	doc.Find("div.YMlKec.fxKbKc").First().Each(func(i int, s *goquery.Selection) {
		priceText := s.Text()
		quote.Price = parsePrice(priceText)
	})

	// Fallback: try just .YMlKec if the specific class wasn't found
	if quote.Price == 0 {
		doc.Find("div.YMlKec").First().Each(func(i int, s *goquery.Selection) {
			priceText := s.Text()
			quote.Price = parsePrice(priceText)
		})
	}

	// Extract percentage change - look for the change indicator
	// Google uses class "JwB6zf" for percentage displays
	doc.Find("div.JwB6zf").First().Each(func(i int, s *goquery.Selection) {
		changeText := s.Text()
		quote.Change = parsePercentage(changeText)
	})

	// Validate we got data
	if quote.Price == 0 {
		return nil, fmt.Errorf("could not extract price for %s", symbol)
	}

	return quote, nil
}

// parsePrice extracts numeric value from price string like "$195.34" or "₹20.91"
func parsePrice(s string) float64 {
	// Remove currency symbols and commas
	re := regexp.MustCompile(`[^\d.]`)
	cleaned := re.ReplaceAllString(s, "")
	
	price, err := strconv.ParseFloat(cleaned, 64)
	if err != nil {
		return 0
	}
	return price
}

// parsePercentage extracts value from strings like "+1.67%" or "-0.95%"
func parsePercentage(s string) float64 {
	// Remove % sign and parse
	s = strings.TrimSpace(s)
	s = strings.TrimSuffix(s, "%")
	s = strings.ReplaceAll(s, ",", "")
	
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return val
}

// ScrapeMultipleQuotes fetches multiple stocks from Google Finance
func ScrapeMultipleQuotes(symbols []string) []GoogleFinanceQuote {
	results := []GoogleFinanceQuote{}
	
	for _, symbol := range symbols {
		quote, err := ScrapeGoogleFinance(symbol)
		if err != nil {
			// Log error but continue with other symbols
			fmt.Printf("Scraper error for %s: %v\n", symbol, err)
			continue
		}
		results = append(results, *quote)
	}
	
	return results
}

// ScrapeGoogleFinanceNews fetches news from the main page or ticker page
func ScrapeGoogleFinanceNews(query string) ([]ScrapedNewsItem, error) {
	// 0. Check cache first (5 minute TTL)
	newsCache.RLock()
	if items, ok := newsCache.Results[query]; ok {
		if time.Now().Before(newsCache.Expiry[query]) {
			newsCache.RUnlock()
			return items, nil
		}
	}
	newsCache.RUnlock()

	// 1. Fetch
	url := "https://www.google.com/finance/?hl=en"
	if query != "" {
		url = fmt.Sprintf("https://www.google.com/finance/quote/%s:NASDAQ", query)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("status code %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	news := []ScrapedNewsItem{}
	
	// Use selectors found by subagent (Jan 2026 Beta Layout)
	doc.Find(".JaNLYd").Each(func(i int, s *goquery.Selection) {
		if len(news) >= 6 { return }
		
		title := s.Find(".pGmFU").Text()
		if title == "" {
			title = s.Find("div.Yfwt5").Text()
		}
		
		if title != "" {
			source := s.Find(".ZMiNk").First().Text()
			if source == "" { source = "Google Finance" }
			
			link, _ := s.Parent().Attr("href")
			if link == "" {
				link, _ = s.Find("a").First().Attr("href")
			}
			
			news = append(news, ScrapedNewsItem{
				Title:   title,
				Summary: title,
				Source:  source,
				Link:    link,
				Date:    "Today",
			})
		}
	})
	
	// Legacy fallback mechanism
	if len(news) == 0 {
		doc.Find("div.yY3Lee").Each(func(i int, s *goquery.Selection) {
			if len(news) >= 6 { return }
			title := s.Find("div.Yfwt5").Text()
			if title != "" {
				source := s.Find("div.sfyJob").Text()
				news = append(news, ScrapedNewsItem{
					Title: title, Summary: title, Source: source, Date: "Today",
				})
			}
		})
	}

	// 3. Update cache if we found results
	if len(news) > 0 {
		newsCache.Lock()
		newsCache.Results[query] = news
		newsCache.Expiry[query] = time.Now().Add(5 * time.Minute)
		newsCache.Unlock()
	}

	return news, nil
}

// MarketIndex represents a scraped market index card
type MarketIndex struct {
	Name    string  `json:"name"`
	Price   float64 `json:"price"`
	Change  float64 `json:"change"`
	Region  string  `json:"region"`
}

// ScrapeMarketIndices fetches market index data from Google Finance
func ScrapeMarketIndices(region string) ([]MarketIndex, error) {
	// Google Finance URL with region parameter
	// Region "India" -> hl=en&gl=IN
	// Region "US" -> hl=en&gl=US
	gl := "US"
	if strings.ToLower(region) == "india" {
		gl = "IN"
	}
	// Use /beta as identified by subagent and screenshot
	url := fmt.Sprintf("https://www.google.com/finance/beta?hl=en&gl=%s", gl)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("status code %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	indices := []MarketIndex{}
	
	// Resilient selection: Look for anything with /quote/ in href that looks like a card
	doc.Find("a[href*='/quote/']").Each(func(i int, s *goquery.Selection) {
		// Specifically target the name div to avoid grabbing symbols/prices in the name
		name := s.Find(".Xc5F3b").Text()
		if name == "" {
			name = s.Find("div").First().Text()
		}

		// CLEANUP: If name contains numbers or %, it's likely concatenated. 
		// Market names like "NIFTY 50" are okay, but "NIFTY 5025,000" needs correction.
		// We'll split before the first digit that isn't part of "50" if it follows a letter.
		if name != "" {
			// Find name in a list of targets first to override
			targets := []string{"NIFTY 50", "SENSEX", "Nifty Bank", "Nifty IT", "S&P BSE SmallCap", "Dow Jones", "S&P 500", "Nasdaq", "Russell", "VIX"}
			displayName := name
			isTarget := false
			for _, t := range targets {
				if strings.Contains(strings.ToLower(name), strings.ToLower(t)) {
					displayName = t
					isTarget = true
					break
				}
			}

			// If not a known target, perform basic cleanup (remove trailing numbers/garbage)
			if !isTarget {
				// Remove anything after the first newline or large number block if it's junk
				if idx := strings.Index(displayName, "\n"); idx != -1 {
					displayName = displayName[:idx]
				}
			}

			valueText := s.Find(".SpkPOc span").First().Text()
			if valueText == "" { valueText = s.Find(".YMlKec").Text() }
			
			changeText := s.Find(".d6uVnc").First().Text()
			if changeText == "" { changeText = s.Find(".JwB6zf").Text() }
			
			priceVal := parsePrice(valueText)
			changeVal := parsePercentage(changeText)

			// Only add if we got a valid price OR it's a priority target
			if isTarget || (priceVal > 0 && len(indices) < 8) {
				// Prevent duplicates (scrapers sometimes hit multiple cards for same index)
				exists := false
				for _, existing := range indices {
					if existing.Name == displayName {
						exists = true
						break
					}
				}
				if !exists {
					indices = append(indices, MarketIndex{
						Name:   displayName,
						Price:  priceVal,
						Change: changeVal,
						Region: region,
					})
				}
			}
		}
	})

	if len(indices) == 0 {
		fmt.Printf("WARNING: Scraped 0 indices for %s. Selectors might be outdated.\n", region)
	}
	return indices, nil
}

// LiveUpdate represents a news snippet from the 'Latest updates' section
type LiveUpdate struct {
	Headline string `json:"headline"`
	Source   string `json:"source"`
	Time     string `json:"time"`
	URL      string `json:"url"`
}

// ScrapeLiveUpdates fetches the 'Latest updates (Live)' section from Google Finance
func ScrapeLiveUpdates(region string) ([]LiveUpdate, error) {
	gl := "US"
	if strings.ToLower(region) == "india" {
		gl = "IN"
	}
	// Use /beta path
	url := fmt.Sprintf("https://www.google.com/finance/beta?hl=en&gl=%s", gl)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("status code %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	updates := []LiveUpdate{}
	
	// 1. Primary: Latest updates (Live)
	// Headline class tOrIed is very reliable for Beta
	doc.Find("a.tOrIed").Each(func(i int, s *goquery.Selection) {
		if len(updates) >= 10 { return }
		
		headline := s.Text()
		if headline != "" {
			// Look for source/time in siblings or parent
			parent := s.Parent()
			source := parent.Find(".SaRbqe").Text()
			timeText := parent.Find(".J5218").Text()
			link, _ := s.Attr("href")
			
			if !strings.HasPrefix(link, "http") {
				link = "https://www.google.com/finance" + strings.TrimPrefix(link, ".")
			}
			
			updates = append(updates, LiveUpdate{
				Headline: headline,
				Source:   source,
				Time:     strings.TrimSpace(strings.ReplaceAll(timeText, "·", "")),
				URL:      link,
			})
		}
	})

	// 2. Fallback: Market Summary (AI Paragraph)
	if len(updates) == 0 {
		fmt.Printf("Live updates section missing for %s, trying market summary...\n", region)
		doc.Find("div.Y8k45b").Each(func(i int, s *goquery.Selection) {
			text := s.Text()
			if text != "" {
				updates = append(updates, LiveUpdate{
					Headline: "Market Summary: " + text,
					Source:   "Google AI Summary",
					Time:     "Recent",
					URL:      url,
				})
			}
		})
	}
	
	// 3. Last Resort: Research Sidebar Bullets
	if len(updates) == 0 {
		fmt.Printf("Summary missing for %s, trying research bullets...\n", region)
		doc.Find("li.R839gf").Each(func(i int, s *goquery.Selection) {
			text := s.Text()
			if text != "" {
				updates = append(updates, LiveUpdate{
					Headline: text,
					Source:   "Market Research",
					Time:     "Recent",
					URL:      url,
				})
			}
		})
	}

	if len(updates) == 0 {
		fmt.Printf("WARNING: Scraped 0 updates for %s.\n", region)
	} else {
		fmt.Printf("Scraped %d update items for %s\n", len(updates), region)
	}
	return updates, nil
}
