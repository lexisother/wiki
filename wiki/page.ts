export default class Page {
  public title: string;
  public filename: string;
  public textRows: string[];
  public commandRows: {
    command: string;
    params: string;
    row: number;
  }[];
  public tags: string[];
  constructor(data: {
    title: string;
    tags: string[];
    filename: string;
    textRows: string[];
    commandRows: {
      command: string;
      params: string;
      row: number;
    }[];
  }) {
    this.title = data.title;
    this.filename = data.filename;
    this.textRows = data.textRows;
    this.commandRows = data.commandRows;
    this.tags = data.tags;
  }

  static readFromPage(text: string, filename: string) {
    let rows = text.split(/\r?\n/);
    let textRows = [];
    let commandRows = [];
    let rowNumber = 0;
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      if (row.startsWith('^')) {
        let rowsplit = row.split('^');
        if (rowsplit.length >= 3) {
          let command = rowsplit[1].trim();
          let params = rowsplit[2].trim();
          commandRows.push({ command, params, row: rowNumber });
        }
        continue;
      }

      if (row.length <= 40) {
        textRows.push(row);
        rowNumber++;
        continue;
      }

      while (row.length > 40) {
        let reasonableBreakingPlace = row.substr(0, 40).lastIndexOf(' ');
        textRows.push(row.substr(0, reasonableBreakingPlace));
        rowNumber++;
        row = row.substr(reasonableBreakingPlace + 1);
      }
      textRows.push(row);
      rowNumber++;
    }

    let commandData = this.getMetadataFromCommands(commandRows);
    let page = {
      filename,
      textRows,
      commandRows,
      ...commandData,
    };

    return new Page(page);
  }

  static getMetadataFromCommands(
    commands: {
      command: string;
      params: string;
    }[],
  ) {
    let title = '';
    let tags: string[] = [];
    commands.forEach((command) => {
      if (command.command === 'title') {
        title = command.params;
      } else if (command.command.startsWith('tag')) {
        command.params
          .split(' ')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .forEach((tag) => tags.push(tag));
      }
    });
    return { title, tags };
  }
}
