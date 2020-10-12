
    // const ohlcGroups = selection.selectAll("g")
    //     .data(data);

    // const ohlcGroupEnter = ohlcGroups
    //     .enter()
    //     .append("g");

    // const highLowEnter = ohlcGroupEnter
    //     .append("line")
    //     .attr("class", "high-low-line");

    // ohlcGroups
    //     .select(".high-low-line")
    //     .merge(highLowEnter)
    //     .transition()
    //     .attr("x1", d => mapX(d.date))
    //     .attr("y1", d => mapY(d.low))
    //     .attr("x2", d => mapX(d.date))
    //     .attr("y2", d => mapY(d.high));

    // const openEnter = ohlcGroupEnter
    //     .append("line")
    //     .attr("class", "open-bar");

    // ohlcGroups
    //     .select(".open-bar")
    //     .merge(openEnter)
    //     .transition()
    //     .attr("x1", d => mapX(d.date))
    //     .attr("y1", d => mapY(d.open))
    //     .attr("x2", d => mapX(d.date) - openCloseLength)
    //     .attr("y2", d => mapY(d.open));

    // const closeEnter = ohlcGroupEnter
    //     .append("line")
    //     .attr("class", "close-bar");

    // ohlcGroups
    //     .select(".close-bar")
    //     .merge(closeEnter)
    //     .transition()
    //     .attr("x1", d => mapX(d.date))
    //     .attr("y1", d => mapY(d.close))
    //     .attr("x2", d => mapX(d.date) + openCloseLength)
    //     .attr("y2", d => mapY(d.close));

    // ohlcGroups
    //     .exit()
    //     .remove();