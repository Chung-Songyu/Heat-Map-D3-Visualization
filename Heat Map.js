const req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
req.send();
req.onload = function() {
  const dataset = JSON.parse(req.responseText).monthlyVariance;

  const padding = {
    top: 60,
    bot: 100,
    left: 150,
    right: 150
  };
  const height = 800;
  const width = 1600;
  const month = {"0": "January", "1": "February", "2": "March", "3": "April", "4": "May", "5": "June", "6": "July", "7": "August", "8": "September", "9": "October", "10": "November", "11": "December"};
  const varianceArr = [d3.min(dataset, (d) => d.variance), d3.max(dataset, (d) => d.variance)];
  const yearArr = [d3.min(dataset, (d) => d.year), d3.max(dataset, (d) => d.year)];
  const colors = [[1, "#0000ff"], [2, "#2c33ff"], [3, "#5866ff"], [4, "#8498ff"], [5, "#b0ccff"], [6, "#dcffff"], [7, "#ffffdc"], [8, "#ffd5b7"], [9, "#ffaa93"], [10, "#ff7f6e"], [11, "#ff5549"], [12, "#ff2b25"], [13, "#ff0000"]];
  const baseTemp = 8.66;

  const svg = d3.select("#container")
                .append("svg")
                .attr("height", height)
                .attr("width", width);
  const tooltip = d3.select("#container")
                    .append("div")
                    .attr("id", "tooltip")
                    .attr("class", "hidden");

  const legendCellWidth = 35;
  const legendCellHeight = 20;
  const legend = d3.select("svg")
                   .append("g")
                   .attr("id", "legend")
                   .selectAll("rect")
                   .data(colors)
                   .enter()
                   .append("rect")
                   .attr("width", legendCellWidth)
                   .attr("height", legendCellHeight)
                   .attr("x", (d, i) => width - padding.right - i * legendCellWidth - 32)
                   .attr("y", (d) => 740)
                   .style("fill", (d, i) => colors[colors.length - 1 - i][1]);
  const legendDomain = [];
  for(i=0; i<=13; i++) {
    legendDomain.push(Number((baseTemp + varianceArr[0] + i * (varianceArr[1] - varianceArr[0]) / 13).toFixed(1)));
  }
  const legendRange = [];
  for(i=0; i<=13; i++) {
    legendRange.push(i*legendCellWidth);
  }
  const legendXScale = d3.scaleOrdinal()
                         .domain(legendDomain)
                         .range(legendRange);
  const legendXAxis = d3.axisBottom(legendXScale);
  svg.append("g")
     .attr("transform", "translate(" + (width - padding.right - (colors.length - 1) * legendCellWidth - 32) + ", " + (740 + legendCellHeight) + ")")
     .attr("id", "legend-x-axis")
     .call(legendXAxis);

  const xScale = d3.scaleBand()
                   .domain([...new Set(dataset.map((d) => d.year))])
                   .range([padding.left, width - padding.right]);
  const xAxis = d3.axisBottom(xScale)
                  .tickValues([...new Set(dataset.map((d) => d.year).filter((d) => d%10==0))]);
  svg.append("g")
     .attr("transform", "translate(0, " + (height - padding.bot) + ")")
     .attr("id", "x-axis")
     .call(xAxis);
  svg.append("text")
     .text("Year")
     .attr("id", "xAxisLabel")
     .attr("transform", "translate(" + width/2 + ", 760)");

  const yScale = d3.scaleBand()
                   .domain(Object.values(month))
                   .rangeRound([padding.top, height - padding.bot]);
  const yAxis = d3.axisLeft(yScale);
  svg.append("g")
     .attr("transform", "translate(" + padding.left + ", 0)")
     .attr("id", "y-axis")
     .call(yAxis);
  svg.append("text")
     .text("Month")
     .attr("id", "yAxisLabel")
     .attr("transform", "translate(60, " + height/2 + ")rotate(270)");

  const cellColor = (variance) => {
    for(i=1; i<legendDomain.length; i++) {
      if(baseTemp + variance <= legendDomain[i]) {
        return colors[i-1][1];
      } else if(baseTemp + variance > legendDomain[legendDomain.length - 1]) {
        return colors[colors.length - 1][1];
      }
    }
  };

  svg.append("g")
     .selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("width", (width - padding.left - padding.right)/(yearArr[1] - yearArr[0] + 1))
     .attr("height", (height - padding.top - padding.bot)/12)
     .attr("x", (d) => xScale(d.year))
     .attr("y", (d) => (d.month - 1) * (height - padding.top - padding.bot)/12 + padding.top)
     .style("fill", (d) => cellColor(d.variance))
     .attr("class", "cell")
     .attr("data-month", (d) => d.month - 1)
     .attr("data-year", (d) => d.year)
     .attr("data-temp", (d) => d.variance)
     .on("mouseover", function(d, i) {
        d3.select("#tooltip").classed("hidden", false);
        tooltip.style("top", (i.month - 1) * (height - padding.top - padding.bot)/12 + padding.top - 30 + "px")
               .style("left", xScale(i.year) + 10 + "px")
               .text(month[i.month - 1] + " " + i.year + ", Temp: " + (baseTemp + i.variance).toFixed(2))
               .attr("data-year", i.year);
     })
     .on("mouseout", function(d, i) {
        tooltip.attr("class", "hidden");
     });
};